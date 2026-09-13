# Local Code Search

![Demo](demo.gif)

Search your codebase using plain English, right inside VS Code — entirely
locally. No code is ever sent to the cloud.

## Why

Most AI code search tools send your code to a third-party API. This one
doesn't. Everything — parsing, embeddings, and search — runs on your own
machine, using a custom-built search engine under the hood.

## Features

- **Semantic search** — search by meaning ("how do I set a timeout"), not
  exact keywords
- **Click to jump** — results take you straight to the exact function and
  line
- **Fully local** — your code never leaves your computer
- **Fast** — powered by a custom-built approximate nearest-neighbor index,
  benchmarked at ~2x faster than brute-force search with 100% recall on
  real codebases ([see benchmarks](https://github.com/omujadhav/local-code-search#benchmarks))

## Setup

1. Install the [local-code-search core engine](https://github.com/omujadhav/local-code-search) (Python)
2. In VS Code settings, search "Local Code Search" and set:
   - **Python Path** → path to your Python (or venv) executable
   - **Main Script Path** → path to the core engine's `src/main.py`

## Usage

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run **"Local Code Search: Index Workspace"** (only needed once per codebase, or after major changes)
3. Run **"Local Code Search: Search Codebase"** and type your question in plain English
4. Click a result to jump straight to that code

## License

MIT