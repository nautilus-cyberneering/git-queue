# Git Queue Documentation

<!-- markdownlint-disable-next-line MD013 -->
[![Check dist/](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/check-dist.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/check-dist.yml) [![MegaLinter](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/mega-linter.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/mega-linter.yml) [![Test](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/test.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/test.yml) [![Test build](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/test-build.yml/badge.svg)](https://github.com/Nautilus-Cyberneering/git-queue/actions/workflows/test-build.yml)

**A GitHub Action to handle job queues stored in Git**.

Welcome to the Git Queue documentation for the [Git Queue - GitHub Action](https://github.com/Nautilus-Cyberneering/git-queue).

> Git Queue is a job queue with concurrency optimistic lock mechanism to guarantee job execution order (by updating the job state), implemented with a event sourcing approach, using empty git commits as the event store. Currently with one pending-to-process job limit.

This is how  `git log` looks when you use the queue:

![Sequence diagram](./images/git-log-screenshot.png)

The queue has the following characteristics:

- It only allows processing one pending job at the same time.
- Jobs are done by GitHub workflows intended to create git commits and merge them into target branches.
- It provides an optimistic locking mechanism to guarantee that commits are merged in a mutual exclusion way, avoiding duplicate commits. When the queue accepts more than one active job (not finished) it will also guarantee the execution order.

And features:

- More than one pending job.
- Log job execution: `start-job`, `finish-job`.
- Custom payload for queue commands.

Check the [Roadmap](https://github.com/Nautilus-Cyberneering/git-queue/issues/6) for upcoming features.

## Use case

One comment use case is updating a submodule in a project when the submodule repository is updated.

- You have two Git repositories: `R1` and `R2`.
- `R1` is a submodule of `R2`.
- When a new commit is added to the main branch in `R1` you want to update the submodule in `R2`.
- You have a scheduled workflow `W` in `R2` to import the latest changes from `R1`.

![Sequence diagram](./images/sequence-diagram.svg)

- `T1`. Add a new file to the library (`1.txt`)
- `T2`. We run `W1` to update the library, however, for some reason, this process takes more than 10 minutes.
- `T3`. We modify file `1.txt` in the library.
- `T4`. (T2+10") We run a second workflow `W2` to update the library.
- `T5`. The workflow `W2` finishes and creates a commit with the second version of file `1.txt`.
- `T6`. The workflow `W1` finishes and overwrites the first version of file `1.`txt`.

## Credits

Original idea by [Cameron Garnham](https://github.com/da2ce7).

The [gpg.ts](https://github.com/Nautilus-Cyberneering/git-queue/blob/main/src/__tests__/gpg.ts) and [openpgp.ts](https://github.com/Nautilus-Cyberneering/git-queue/blob/main/src/__tests__/openpgp.ts) files were originally copied from this [GitHub Action repository](https://github.com/crazy-max/ghaction-import-gpg).

## License

MIT. See [LICENSE](https://github.com/Nautilus-Cyberneering/git-queue/blob/main/LICENSE) for more details.

## Projects using Git Queue

- [Chinese Ideographs Website](https://github.com/Nautilus-Cyberneering/chinese-ideographs-website)
