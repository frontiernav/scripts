# Extractors for Xenoblade Chronicles 2

Generates FrontierNav-compatible data using data tables from Xenoblade Chronicles 2.

## Installation

Make sure you have the following installed:

- NodeJS (v10.x)
- Yarn (Latest)

You'll also need to find the input data yourself and place it in a `./data` directory as the following:

```
data
├── all.csv  # single CSV file with all 3D map markers
├── database # directory with all JSON tables in their original directory structure.
└── mapinfo  # directory with JSON tables that map 3D areas of each in-game map to 2D menu maps
```

## Usage

Run the following to output TSVs to `./out`.

```sh
yarn workspace @frontiernav/extractors-xenoblade-chronicles-2 extract
```

## Useful Links

- [Xenoblade 2 data tables](https://xenoblade.github.io/xb2/index.html)
