# color-swatches-action

A GitHub Action that extracts hex color codes from files and generates SVG color swatches.

Supports all CSS/VS Code hex formats: `#RGB`, `#RGBA`, `#RRGGBB`, and `#RRGGBBAA`.

## Example

The swatches below are generated from [examples/colors.css](examples/colors.css) by
the [test workflow](.github/workflows/test.yml), which runs this action on itself.

| Color | Hex | Swatch |
| ----- | --- | ------ |
| Red | `#ff0000` | ![#ff0000](examples/swatches/ff0000.svg) |
| Green | `#00ff00` | ![#00ff00](examples/swatches/00ff00.svg) |
| Blue | `#0000ff` | ![#0000ff](examples/swatches/0000ff.svg) |
| Yellow | `#ffff00` | ![#ffff00](examples/swatches/ffff00.svg) |
| Cyan | `#00ffff` | ![#00ffff](examples/swatches/00ffff.svg) |
| Magenta | `#ff00ff` | ![#ff00ff](examples/swatches/ff00ff.svg) |
| White | `#ffffff` | ![#ffffff](examples/swatches/ffffff.svg) |
| Grey | `#808080` | ![#808080](examples/swatches/808080.svg) |
| Black | `#000000` | ![#000000](examples/swatches/000000.svg) |

## Usage

Add to your workflow:

```yaml
- uses: andornaut/color-swatches-action@main
  with:
    files: 'themes/*.json'
    out-dir: 'swatches'
```

### Inputs

| Input | Description | Default |
| ----- | ----------- | ------- |
| `files` | Space-separated files to extract colors from (supports globs) | *required* |
| `out-dir` | Output directory for SVG swatch files | *required* |
| `commit` | Whether to commit and push generated swatches | `true` |

### Example workflow

```yaml
name: Generate color swatches

on:
  push:
    branches: [main]
    paths:
      - themes/**

  workflow_dispatch:

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: andornaut/color-swatches-action@main
        with:
          files: 'themes/*.json'
          out-dir: 'swatches'
```

## Quick setup

Run the setup script to generate the workflow file in your repo:

```bash
bash <(curl -s https://raw.githubusercontent.com/andornaut/color-swatches-action/main/setup.sh) \
  --files 'themes/*.json' \
  --out-dir 'swatches'
```

## Referencing swatches in markdown

The generated SVG files are named by hex value (e.g. `c0fe04.svg`, `c0fe0440.svg`). Reference them in your README:

```markdown
| Color | Hex | Usage |
| ----- | --- | ----- |
| ![#c0fe04](swatches/c0fe04.svg) Lime Green | `#c0fe04` | Accent color |
```

## License

[MIT](LICENSE)
