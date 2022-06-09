# Git Queue

<!-- markdownlint-disable-next-line MD013 -->
[![Check dist/](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/check-dist.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/check-dist.yml) [![MegaLinter](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/mega-linter.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/mega-linter.yml) [![Test](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/test.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/test.yml) [![Test build](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/test-build.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/test-build.yml) [![CodeQL](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/codeql.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/codeql.yml) [![Deploy Documentation](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/deploy-documentation.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/deploy-documentation.yml) [![Publish GitHub Release](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/publish-github-release.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/publish-github-release.yml)

Documentation: <https://nautilus-cyberneering.github.io/git-queue/>

This GitHub Action is a job queue with the following characteristics:

- It only allows the execution of a job at the same time. Multiple pending jobs is allowed.
- Jobs are done by GitHub workflows intended to create git commits and merge them into target branches.
- It provides an optimistic locking mechanism to guarantee that commits are merged in a mutual exclusion way, avoiding duplicate commits. When the queue accepts more than one active job (not finished) it will also guarantee the execution order.

Formal definition:

> A job queue with concurrency optimistic lock mechanism to guarantee job execution order (by updating the job state), implemented with a event sourcing approach, using empty git commits as the event store. Currently with one pending-to-process job limit.

- [Requirements](#requirements)
- [Features](#features)
- [Usage](#usage)
- [Customizing](#customizing)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Environment variables](#environment-variables)
- [Development](#development)
- [Credits](#credits)
- [License](#license)

## Requirements

Since the queue uses empty commits as the queue messages store it requires to be very careful when using some Git commands to re-write the Git history. `git commit --amend` or `git rebase` could alter or destroy the queue integrity.

On the other hand, Git commands that create new commits (rebase, cherry-pick, ...) also generate new commit hashes breaking the links between the queue messages. Queue messages can contain references to other messages using the commit hashes inside the commit message.

## Features

- More than one pending job.
- Log job execution: `start-job`, `finish-job`.
- Custom payload for queue commands.

Check the [Roadmap](https://github.com/Nautilus-Cyberneering/git-queue/issues/6) for upcoming features.

### When to use it

You can use it if:

- You have workflows running in parallel.
- The workflows are going to create new commits in a branch and those commits are going to be merged into another branch.
- And you want to coordinate them to avoid concurrency problems like duplicate commits or commits in the wrong order.

### Why use it

There are other alternatives like [GitHub concurrency groups](https://docs.github.com/en/actions/using-jobs/using-concurrency), but:

- In some cases, it could be convenient not to couple your application to the GitHub infrastructure.
- Concurrency problems are very tricky to detect and solve. This solution offers a high level of traceability.
- This solution does not require external services, only Git.

### Use case

One comment use case is updating a submodule in a project when the submodule repository is updated.

- You have two Git repositories: `R1` and `R2`.
- `R1` is a submodule of `R2`.
- When a new commit is added to the main branch in `R1` you want to update the submodule in `R2`.
- You have a scheduled workflow `W` in `R2` to import the latest changes from `R1`.

![Sequence diagram](./docs/images/sequence-diagram.svg)

- `T1`. Add a new file to the library (`1.txt`)
- `T2`. We run `W1` to update the library, however, for some reason, this process takes more than 10 minutes.
- `T3`. We modify file `1.txt` in the library.
- `T4`. (T2+10") We run a second workflow `W2` to update the library.
- `T5`. The workflow `W2` finishes and creates a commit with the second version of file `1.txt`.
- `T6`. The workflow `W1` finishes and overwrites the first version of file `1.`txt`.

## Usage

It works on Linux, macOS and Windows [virtual environments](https://help.github.com/en/articles/virtual-environments-for-github-actions#supported-virtual-environments-and-hardware-resources).

> IMPORTANT: It has only be tests on Linux. You can contribute [testing it on other operating systems](https://github.com/Nautilus-Cyberneering/git-queue/issues/49).

The action has 3 different commands (specified by the input `action`):

- `create-job`: it allows you to create a new job with any payload.
- `start-job`: it allows the workflow to create a commit when hte job process starts.
- `finish-job`: it allows the workflow to mark the nob as finished.

And one query (also specified by the input `action`):

- `next-job`: it returns the next pending to process job.

You should:

- Create a new Job (`create-job`) and push it immediately to the `main` branch (or whatever your PR target branch is).
- Later, a worker workflow can ask the queue for the next job (`next-job`). The first commit should be the starting commit (`start-job`) and the latest one the finishing commit (`finish-job`).

And the end of the process your `git log` output should be like this:

![Sequence diagram](./docs/images/git-log-screenshot.png)

Sample workflow:

```yaml
name: your workflow

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Set up git committer identity
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'

      - name: Install dependencies and build
        run: yarn install && yarn build && yarn package

      - name: Create a temp git dir
        run: |
          mkdir ${{ runner.temp }}/temp_git_dir
          cd ${{ runner.temp }}/temp_git_dir
          git config --global init.defaultBranch main
          git init
          git status

      - name: Create new job
        id: create-job
        uses: Nautilus-Cyberneering/git-queue@v1
        with:
          git_repo_dir: ${{ runner.temp }}/temp_git_dir
          queue_name: 'library update - library-aaa'
          action: 'create-job'
          job_payload: '{"field": "value", "state": "pending"}'

      - name: Mark job as started
        id: start-job
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        uses: Nautilus-Cyberneering/git-queue@v1
        with:
          git_repo_dir: ${{ runner.temp }}/temp_git_dir
          queue_name: 'library update - library-aaa'
          action: 'start-job'
          job_payload: '{"field": "value", "state": "started"}'

      - name: Mutual exclusion code
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        run: echo "Running the job that requires mutual exclusion"

      - name: Get next job
        id: get-next-job
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        uses: Nautilus-Cyberneering/git-queue@v1
        with:
          git_repo_dir: ${{ runner.temp }}/temp_git_dir
          queue_name: 'library update - library-aaa'
          action: 'next-job'

      - name: Mark job as finished
        id: finish-job
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        uses: Nautilus-Cyberneering/git-queue@v1
        with:
          git_repo_dir: ${{ runner.temp }}/temp_git_dir
          queue_name: 'library update - library-aaa'
          action: 'finish-job'
          job_payload: '{"field": "value", "state": "finished"}'

      - name: Show new commits
        run: |
          cd ${{ runner.temp }}/temp_git_dir
          git show --pretty="fuller" --show-signature ${{ steps.create-job.outputs.job_commit }}
          git show --pretty="fuller" --show-signature ${{ steps.start-job.outputs.job_commit }}
          git show --pretty="fuller" --show-signature ${{ steps.finish-job.outputs.job_commit }}
```

## Customizing

### Inputs

The following inputs are available:

| Name                     | Type   | Command | Query | Description                                                                                                                 |
|--------------------------|--------|---------|-------|-----------------------------------------------------------------------------------------------------------------------------|
| `queue_name`             | String | all     | all   | Queue name. It cannot contain special characters or white spaces.                                                           |
| `action`                 | String | all     | all   | Queue actions: `create-job`, `next-job`, `start-job`, `finish-job`.                                                         |
| `job_payload`            | String | all     | none  | Job payload. It can be any string.                                                                                          |
| `git_repo_dir`           | String | all     | all   | The git repository directory. The default value is the current working dir.                                                 |
| `git_commit_gpg_sign`    | String | all     | none  | The git commit [--gpg-sign](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---gpg-signltkeyidgt) argument. |
| `git_commit_no_gpg_sign` | String | all     | none  | The git commit [--no-gpg-sign](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---no-gpg-sign) argument.    |

### Outputs

The following outputs are available:

| Name           | Type   | Command      | Query      | Description                                                                         |
|----------------|--------|--------------|------------|-------------------------------------------------------------------------------------|
| `job_created`  | String | `create-job` | none       | Boolean, `true` if the job was successfully created.                                |
| `job_started`  | String | `start-job`  | none       | Boolean, `true` if the job was successfully started.                                |
| `job_finished` | String | `finish-job` | none       | Boolean, `true` if the job was successfully finished.                               |
| `job_commit`   | String | all          | none       | The commit hash of the newly created commits, when the action creates a new commit. |
| `job_payload`  | String | none         | `next-job` | The job payload. Only for `next-job` action.                                        |

### Environment variables

If you need to pass environment variables to the `git` child process, you only need to set those variables by using the `env` section of the action:

```yml
- name: Create job
  id: create-job
  uses: Nautilus-Cyberneering/git-queue@v1
  with:
    queue_name: "Library Update - library-aaa"
    action: "create-job"
    job_payload: "job_payload"
  env:
    GNUPGHOME: '~/.gnupg'
    GIT_AUTHOR_NAME: 'A Committer'
    GIT_AUTHOR_EMAIL: 'committer@example.com'
    GIT_AUTHOR_DATE: '2005-04-07T22:13:13'
    GIT_COMMITTER_NAME: 'A Committer'
    GIT_COMMITTER_EMAIL: 'committer@example.com'
    GIT_COMMITTER_DATE: '2005-04-07T22:13:13'
```

## Development

Requirements:

- Node >= 16.13.2

Install:

```shell
yarn install
```

Build the typescript and package it for distribution:

```bash
yarn build && yarn package
```

Run all tests:

```shell
yarn test
```

Run the app locally:

```shell
yarn run build && \
INPUT_QUEUE_NAME="queue-name" \
INPUT_ACTION="next-job" \
  node dist/index.js
```

Run `TypeScript` linter:

```shell
yarn format && yarn lint
```

Run [MegaLinter](https://github.com/megalinter/megalinter) locally:

```shell
mega-linter-runner -e 'ENABLE=MARKDOWN'
```

You can use the `-e` option to select the linters you want to execute.

You can run workflows locally with the [act](https://github.com/nektos/act) app.

## Credits

Original idea by [Cameron Garnham](https://github.com/da2ce7).

The [gpg.ts](src/__tests__/gpg.ts) and [openpgp.ts](src/__tests__/openpgp.ts) files were originally copied from this [GitHub Action repository](https://github.com/crazy-max/ghaction-import-gpg).

## License

MIT. See `LICENSE` for more details.
