# Contributing

We are really happy to know that you want to contribute to the project!
However, to ensure that the project keeps improving without compromising its integrity or quality, please follow this guide to ensure that your contribution is as useful as possible.

## Table of Contents

1. [What to know before contributing](#what-to-know-before-contributing)
2. [How can I contribute?](#how-can-i-contribute)
    - [Bug reporting](#bug-reporting)
    - [New features suggestion](#new-features-suggestion)
    - [Committing code to an issue](#committing-code-to-an-issue)
    - [Additional documentation](#additional-documentation)
3. [Style guides](#style guides)
    - [Code style guide](#code-style-guide)
    - [Documentation style guide](#documentation-style-guide)
4. [Issues, Commits and Pull Requests](#issues-commits-and-pull-requests)
    - [Commit messages](#commit-messages)

## What to know before contributing

This project is still at an early stage. That means is not intended for production.

Please read our [Contributor Code of Conduct](./CODE_OF_CONDUCT.md).

## How can I contribute?

### Bug reporting

Before creating bug reports, please check if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one. If you find a Closed issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

If the problem hasn't been reported, create a new [GitHub issue](https://docs.github.com/es/issues/tracking-your-work-with-issues/about-issues), providing the following information:

- **A clear and descriptive title**  for the issue to identify the problem.
- **A description of the steps which reproduce the problem**, as detailed as possible.
- **Describe the behavior you observed after following the steps**  and why that behavior is erroneous or unexpected.
- If possible, **include screenshots and animated GIFs**.

### New features suggestion

Features / improvement suggestions are submitted as  [GitHub issues](https://docs.github.com/es/issues/tracking-your-work-with-issues/about-issues).  Please, before submitting a new one, please check if the improvement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
When creating an improvement issue, please provide the following information:

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a description of the suggested enhancement** as detailed as possible.
- **Explain why this improvement would be useful** to most users.

### Committing code to an issue

Before writing any code for the repository please do the following:  

- Review the applicable style guides.
- Check that the new code will not compromise the quality, stability or security of the codebase.
- Any new code is added to the repository using Pull Requests that must be reviewed and approved by the community before being merged or rebased to the repository.
- When creating the commit and the pull request, please refer also to the section Issues, Commits and Pull Requests.
- Whenever it is possible, new features should have Unit Tests to maintain (or increase) the code test coverage before adding it.
- We are using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Additional documentation

New documentation contributions are also welcomed. They can improve the official documentation, add new examples or tutorials.
The new documents must be added to the "documentation" folder, and they must be created or modified using the same issue - pull request method as the code contributions.
Document format should be Markdown unless an alternative format is really necessary. Naming should adhere to underscore [kebab-case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).

## Style guides

In this repository we use Megalinter. We recommend you to install the local checker so as to speed up your contribution process. You will find the local installation options at the bottom of the page: <https://oxsecurity.github.io/megalinter/v5/installation/>.

### Code style guide

#### Typescript

<https://typescript-eslint.io/>

#### Javascript

<https://standardjs.com/rules.html>

#### HTML & CSS

<https://google.github.io/styleguide/htmlcssguide.html>

#### Fundamentals

- **Clarity** at the point of use is your most important goal. Clarity is more important than brevity

- Projects should not throw any warnings when built.

#### Conventions

#### Linting

We are using [MegaLinter](https://github.com/megalinter/megalinter/) to enforce normalization. Please read the [documentation](https://nautilus-cyberneering.github.io/nautilus-librarian/) to know how you can run the linter locally.

#### Naming

- Include all the words needed to avoid ambiguity, but omit needless words

- Name entities according to their roles, rather than their type constraints.

- Names of types and protocols are UpperCamelCase. Everything else is lowerCamelCase.

- Declarations should form correct human-readable phrases when read aloud.

- Methods without side-effects have **noun** names (originalSize()). Methods with side effects have **imperative verb** names (sort()). Non-mutating methods that return new values have **past participle** names (sorted()) or a **noun** if the operation is naturally described by it (union())

- Protocols that describe *what* something is should read as **nouns**  (Collection). Protocols that describe a capability should be named using "-able", "-ible", or "-ing" (Equatable, ProgressReporting).

- Avoid abbreviations

#### Comments

- **Self-documented code** is preferred over comments.

- When completely needed, comments must be written using double slash (//) instead of block syntax (/*...*/). Comments must be kept up-to-date or deleted.

- Public APIs should have HeaderDoc documentation using JavaDoc standards.

### Documentation style guide

Documentation should use Markdown (.md) format. It must be written at least in English, but additional localized versions are also possible.

## Issues, Commits and Pull Requests

Each pull request for new commits must be related to a particular issue, and will be reviewed by the community before being merged or rebased to the codebase.

### Branches

Every issue should have its branch following this format: "issue-##-short-description-using-kebab-case"

### Commit messages

- We are using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Use the present tense and imperative mood ("Add feature", "Change cursor color").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.
- Consider starting the commit message with an applicable emoji (taken from the [Atom Contribution Guidelines](https://github.com/atom/atom/blob/master/CONTRIBUTING.md)):

  - :art: `:art:` when improving the format/structure of the code
  - :racehorse: `:racehorse:` when improving performance
  - :non-potable_water: `:non-potable_water:` when plugging memory leaks
  - :memo: `:memo:` when writing docs
  - :bug: `:bug:` when fixing a bug
  - :fire: `:fire:` when removing code or files
  - :white_check_mark: `:white_check_mark:` when adding tests
  - :lock: `:lock:` when dealing with security
  - :shirt: `:shirt:` when removing linter warnings
