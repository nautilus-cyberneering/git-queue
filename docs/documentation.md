# Documentation

We are using [MkDocs](https://www.mkdocs.org/) for this documentation site.

## Commands

* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.
* `mkdocs gh-deploy -v --force` - Deploy to [GitHub Pages](https://pages.github.com/).

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

## Project layout

```text
    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.
```
