# Git Queue

A GitHub Action that implements a job queue with a concurrency lock by using Git empty commits.

___

* [Features](#features)
* [Usage](#usage)
  * [Workflow](#workflow)
* [Customizing](#customizing)
  * [inputs](#inputs)
  * [outputs](#outputs)
* [Development](#development)
* [License](#license)

## Features

* Works on Linux, macOS and Windows [virtual environments](https://help.github.com/en/articles/virtual-environments-for-github-actions#supported-virtual-environments-and-hardware-resources)

## Usage

### Workflow

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

      - name: Create job
        id: create-job
        uses: ./.github/actions/git-queue
        with:
          queue_name: "Library Update [library-aaa]"
          action: "create-job"
          job_payload: "job_payload"

      - name: Create job debug
        run: |
          echo -e "job_created: ${{ steps.create-job.outputs.job_created }}"
          echo -e "job_commit: ${{ steps.create-job.outputs.job_commit }}"

      - name: Mutual exclusion code
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        run: echo "Running the job that requires mutual exclusion"

      - name: Get next job
        id: get-next-job
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        uses: ./.github/actions/git-queue
        with:
          queue_name: "Library Update [library-aaa]"
          action: "next-job"

      - name: Get next job debug
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        run: |
          echo -e "job_payload: ${{ steps.get-next-job.outputs.job_payload }}"
          echo -e "job_commit: ${{ steps.get-next-job.outputs.job_commit }}"

      - name: Mark job as done
        id: mark-job-as-done
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        uses: ./.github/actions/git-queue
        with:
          queue_name: "Library Update [library-aaa]"
          action: "mark-job-as-done"
          job_payload: "job_payload-done"

      - name: Mark job as done debug
        if: ${{ steps.mark-job-as-done.outputs.job_created == 'true' }}
        run: |
          echo -e "job_commit: ${{ steps.get-next-job.outputs.job_commit }}"
```

## Customizing

### Inputs

Following inputs are available

| Name                     | Type   | Description                                                                                                                |
|--------------------------|--------|----------------------------------------------------------------------------------------------------------------------------|
| `queue_name`             | String | Queue name. It can not contain special characters or white spaces                                                          |
| `action`                 | String | Queue action: [ `next-job`, `create-job`, `mark-job-as-done` ]                                                             |
| `job_payload`            | String | Job payload. It can be any string                                                                                          |
| `git_repo_dir`           | String | The git repository directory. The default value is the current working dir                                                 |
| `git_commit_author`      | String | The git commit [--author](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---authorltauthorgt) argument    |
| `git_commit_gpg_sign`    | String | The git commit [--gpg-sign](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---gpg-signltkeyidgt) argument |
| `git_commit_no_gpg_sign` | String | The git commit [--no-gpg-sign](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---no-gpg-sign) argument    |

### Outputs

Following outputs are available

| Name          | Type   | Description                                                                        |
|---------------|--------|------------------------------------------------------------------------------------|
| `job_created` | String | Boolean, `true` if the job was created successfully                                |
| `job_commit`  | String | The commit hash of the newly created commits, when the action creates a new commit |
| `job_payload` | String | The job payload                                                                    |

### Environment variables

If you need to pass environment variables to the `git` child process, you only need to set those variables by using the `env` section in the action:

```yml
- name: Create job
  id: create-job
  uses: ./.github/actions/git-queue
  with:
    queue_name: "Library Update [library-aaa]"
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

Install:

```shell
yarn install
```

Build the typescript and package it for distribution:

```bash
yarn build && yarn package
```

Run tests:

```shell
yarn test
```

Run the app locally:

```shell
yarn run build && \
INPUT_QUEUE_NAME="Library Update [library-aaa]" \
INPUT_ACTION="next-job" \
  node dist/index.js
```

Run the test workflow locally with `act`:

```shell
act -w ./.github/workflows/test-git-job-action.yml -j build
```

> NOTE: act is not working because [they have not released yet](https://github.com/nektos/act/issues/910#issuecomment-1017536955) the new version supporting `node16`.

## License

MIT. See `LICENSE` for more details.

## Credits

The [gpg.ts](src/__tests__/gpg.ts) and [openpgp.ts](src/__tests__/openpgp.ts) files were copied from this [GitHub Action repository](https://github.com/crazy-max/ghaction-import-gpg).

## Release

### Publish to a distribution branch

Actions are run from GitHub repos so we will check in the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
yarn package
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

### Action versioning

After testing, you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action.
