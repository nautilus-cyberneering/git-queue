# Use

You can use the action as an standard Github Action.

```yml
- name: Create new job
  id: create-job
  uses: Nautilus-Cyberneering/git-queue@v1
  with:
    git_repo_dir: ${{ runner.temp }}/temp_git_dir
    queue_name: 'library update - library-aaa'
    action: 'create-job'
    job_payload: '{"field": "value", "state": "pending"}'
```

You can any any number of new jobs, but you can only process them in order.

## Inputs

| Name                     | Type   | Command | Query | Description                                                                                                                 |
|--------------------------|--------|---------|-------|-----------------------------------------------------------------------------------------------------------------------------|
| `queue_name`             | String | all     | all   | Queue name. It cannot contain special characters or white spaces.                                                           |
| `action`                 | String | all     | all   | Queue actions: `create-job`, `next-job`, `start-job`, `finish-job`.                                                         |
| `job_payload`            | String | all     | none  | Job payload. It can be any string.                                                                                          |
| `git_repo_dir`           | String | all     | all   | The git repository directory. The default value is the current working dir.                                                 |
| `git_commit_gpg_sign`    | String | all     | none  | The git commit [--gpg-sign](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---gpg-signltkeyidgt) argument. |
| `git_commit_no_gpg_sign` | String | all     | none  | The git commit [--no-gpg-sign](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---no-gpg-sign) argument.    |

## Outputs

The following outputs are available:

| Name           | Type   | Command      | Query      | Description                                                                         |
|----------------|--------|--------------|------------|-------------------------------------------------------------------------------------|
| `job_created`  | String | `create-job` | none       | Boolean, `true` if the job was successfully created.                                |
| `job_started`  | String | `start-job`  | none       | Boolean, `true` if the job was successfully started.                                |
| `job_finished` | String | `finish-job` | none       | Boolean, `true` if the job was successfully finished.                               |
| `job_commit`   | String | all          | none       | The commit hash of the newly created commits, when the action creates a new commit. |
| `job_payload`  | String | none         | `next-job` | The job payload. Only for `next-job` action.                                        |

## Commands

The Git Queue action has these commands.

- Create a new job: add a new job to the queue.
- Get the next job: get the next job pending to process.
- Start a job: create a new empty commit to  mark the starting of a job.
- Finish a job: create a new empty commit to mark the finishing of a job.

You can specify the command with the input: `action`.

### Create Job

```yml
- name: Create new job
  id: create-job
  uses: Nautilus-Cyberneering/git-queue@v1
  with:
    git_repo_dir: ${{ runner.temp }}/temp_git_dir
    queue_name: 'library update - library-aaa'
    action: 'create-job'
    job_payload: '{"field": "value", "state": "pending"}'
```

### Get next Job

```yml
- name: Get next job
  id: get-next-job
  if: ${{ steps.create-job.outputs.job_created == 'true' }}
  uses: Nautilus-Cyberneering/git-queue@v1
  with:
    git_repo_dir: ${{ runner.temp }}/temp_git_dir
    queue_name: 'library update - library-aaa'
    action: 'next-job'
```

### Start Job

```yml
- name: Mark job as started
  id: start-job
  if: ${{ steps.create-job.outputs.job_created == 'true' }}
  uses: Nautilus-Cyberneering/git-queue@v1
  with:
    git_repo_dir: ${{ runner.temp }}/temp_git_dir
    queue_name: 'library update - library-aaa'
    action: 'start-job'
    job_payload: '{"field": "value", "state": "started"}'
```

### Finish Job

```yml
- name: Mark job as finished
  id: finish-job
  if: ${{ steps.create-job.outputs.job_created == 'true' }}
  uses: Nautilus-Cyberneering/git-queue@v1
  with:
    git_repo_dir: ${{ runner.temp }}/temp_git_dir
    queue_name: 'library update - library-aaa'
    action: 'finish-job'
    job_payload: '{"field": "value", "state": "finished"}'
```

## Environment variables

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

## Design you workflows

You can define your own workflows to create and consume jobs. You can also push directly to the target branch or create pull request.

As an example, you could use the `work-allocator` and `worker` pattern.

Work allocator:

```yml
name: Work allocator

on:
  push:
    branches: [main]
  schedule:
    - cron: "0,10,20,30,40,50 * * * *"
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
          submodules: "true"

      - name: Get next job
        id: get-next-job
        uses: Nautilus-Cyberneering/git-queue@v1-beta
        with:
          queue_name: "library-update"
          action: "next-job"
          git_commit_no_gpg_sign: "false"

      - name: Create new job
        id: create-job
        if: ${{ steps.get-next-job.outputs.job_found == 'false' && steps.update-submodule.outputs.updated == 'true' }}
        uses: Nautilus-Cyberneering/git-queue@v1-beta
        with:
          queue_name: "library-update"
          action: "create-job"
          job_payload: "payload"
          git_commit_no_gpg_sign: "false"

      - name: Show new git-queue commit
        if: ${{ steps.get-next-job.outputs.job_found == 'false' && steps.update-submodule.outputs.updated == 'true' && steps.create-job.outputs.job_created == 'true' }}
        run: |
          git show --show-signature ${{ steps.create-job.outputs.job_commit }}

      - name: Push new job to the queue
        id: push-job
        if: ${{ steps.get-next-job.outputs.job_found == 'false' && steps.update-submodule.outputs.updated == 'true' && steps.create-job.outputs.job_created == 'true' }}
        shell: bash
        run: |
          git push
```

Worker:

```yml
name: Worker

on:
  push:
    branches: [main]
  schedule:
    - cron: "0,10,20,30,40,50 * * * *"
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Get next job
        id: get-next-job
        uses: Nautilus-Cyberneering/git-queue@v1-beta
        with:
          queue_name: "library-update"
          action: "next-job"
          git_commit_no_gpg_sign: "false"

      - name: Mark job as started
        id: start-job
        if: ${{ steps.get-next-job.outputs.job_found == 'true' }}
        uses: Nautilus-Cyberneering/git-queue@v1-beta
        with:
          queue_name: "library-update"
          action: "start-job"
          job_payload: "payload"
          git_commit_no_gpg_sign: "false"

        # Begin mutual exclusion job

        # JOB PROCESSING HERE

        # End mutual exclusion job

      - name: Mark job as finished
        id: finish-job
        if: ${{ steps.start-job.outputs.job_started == 'true' }}
        uses: Nautilus-Cyberneering/git-queue@v1-beta
        with:
          queue_name: "library-update"
          action: "finish-job"
          job_payload: "payload"
          git_commit_no_gpg_sign: "false"

      - name: Show new commits
        if: ${{ steps.get-next-job.outputs.job_found == 'true' }}
        run: |
          git log --pretty="fuller" --show-signature -5

      - name: Push
        id: push
        if: ${{ steps.get-next-job.outputs.job_found == 'true' }}
        shell: bash
        run: |
          git push
```

