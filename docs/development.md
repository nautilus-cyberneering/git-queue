# Development

Requirements:

- Node >= 16.13.2

Basic commands:

- Install with `yarn install`.
- Build the typescript and package it for distribution `yarn build && yarn package`.
- Run all tests `yarn test`.
- Run `TypeScript` linter `yarn format && yarn lint`.

Run the app locally:

```shell
yarn run build && \
INPUT_QUEUE_NAME="queue-name" \
INPUT_ACTION="next-job" \
  node dist/index.js
```

Run [MegaLinter](https://github.com/megalinter/megalinter) locally:

```shell
mega-linter-runner -e 'ENABLE=MARKDOWN'
```

You can use the `-e` option to select the linters you want to execute.

You can run workflows locally with the [act](https://github.com/nektos/act) app.

## Commit conventions

**General conventions**:

- We follow [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/).
- When we integrate a new dependency or upgrade dependencies, each indivisible dependency change (update, remove, add) should have its own commit including:
  - Updated `package.json` file.
  - Updated `yarn.lock`.
  - Regenerated `dist` directory.
  - Updated documentation, if needed.
  - Minimal changes to the code to accommodate the change in the dependencies.
- We require signed commits.

**Conventions related to pull requests**:

- We use merge commits.
Make sure commits keep their signatures.

**Conventions related to releases**:

- Every commit should build the application with `yarn build && yarn package` because every single commit should be executable on a third-party workflow and the action has to be already built in the `dist` folder.
<!-- markdownlint-disable-next-line MD013 -->
- In some cases, commits are generated automatically, for example by the `dependabot` or `MegaLinter` (if enabled). Those bots do not build and package the action, so whoever is responsible for merging those commits should change them to include the built app. That could be very tedious work so very often could be more convenient just to re-create manually those changes including the built app (for example when you are updating some node packages at the same time). The same logic applies to signed commits (`dependabot` creates signed commits but `MegaLinter` does not), that's one of the reasons why auto-fix is not enabled for `MegaLinter`.
<!-- markdownlint-disable-next-line MD013 -->
- For some commits, the `dist` folder might not be affected, which means if you run `yarn build && yarn package` again the commit content for the `dist` folder is not going to change. In such cases, you could merge `dependabot` commits directly from the GitHub interface. That happens when `dependabot` upgrades an action in a workflow. In general, changes in the `.github` folder do not affect the `dist` folder.

## Update node dependencies

- Dependencies updates should be in an independent branch, as any other code modification.
- We are reusing always the same [issue](https://github.com/Nautilus-Cyberneering/git-queue/issues/183) and the same [branch name](https://github.com/Nautilus-Cyberneering/git-queue/tree/issue-183-update-node-depdencies) for dependencies update. That way we have a dependency update history (issue) and a consistent updates branch that can be used for automation.
- If a dependency breaks the code (i.e, does not compile or the tests do not pass), it should be solved in a separate, specific issue.

Given everything, the process of dependencies updates would be as follows:

General update (roughly once a week):

- Create the branch (using always the same name)
- Execute yarn upgrade --major
- Execute tests
- If tests do not pass or do not compile, exclude update that causes it to solve it a separate issue
- Create PR as usual
- Merge+rebase as usual
- Write a comment on the update issue to list all the `dependabot` PRs applied in this update iteration
- Affected `dependabot` PRs should be closed after applied, or close them manually

If a security alert is warned by dependabot (critical security vulnerability) proceed immediately with the same workflow, but only with the update that patches it using a specific issue.

For not critical updates we update them roughly once a week.

> NOTE: be aware of merging `dependabot` PRs directly using the GitHub interface. In some cases might produce [unverified commits](https://github.com/Nautilus-Cyberneering/git-queue/discussions/205#discussioncomment-2731691). When GitHub cannot sign the rebased commits.

## Releases

See [commit conventions related to releases](#commit-conventions).

More info about releases in this [discussion](https://github.com/Nautilus-Cyberneering/git-queue/discussions/152).

### Publish to a distribution branch

Actions are run from GitHub repos so we will check in the packed `dist` folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
yarn package
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v1
```

> Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published!

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

### Action versioning

After testing, you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action.

## Documentation

We are using [MkDocs](https://www.mkdocs.org/) for this documentation site.

### Commands

- `mkdocs serve` - Start the live-reloading docs server.
- `mkdocs build` - Build the documentation site.
- `mkdocs -h` - Print help message and exit.
- `mkdocs gh-deploy -v --force` - Deploy to [GitHub Pages](https://pages.github.com/).

You might see this error when you try to execute those commands:

```shell
$ mkdocs
Command 'mkdocs' not found, but can be installed with:
sudo apt install mkdocs
```

You can install it with:

```shell
pip install mkdocs
```

### Project layout

```text
    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.
```
