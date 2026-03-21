#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --files <glob> --out-dir <dir> [--paths <trigger-paths>]"
  echo
  echo "Generates a GitHub Actions workflow that runs color-swatches-action."
  echo
  echo "Options:"
  echo "  --files    Files to extract colors from (required)"
  echo "  --out-dir  Output directory for swatches (required)"
  echo "  --paths    Comma-separated trigger paths (default: auto-detected from --files)"
  exit 1
}

FILES=""
OUT_DIR=""
PATHS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --files) FILES="$2"; shift 2 ;;
    --out-dir) OUT_DIR="$2"; shift 2 ;;
    --paths) PATHS="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

if [[ -z "$FILES" || -z "$OUT_DIR" ]]; then
  echo "Error: --files and --out-dir are required"
  echo
  usage
fi

if [[ -z "$PATHS" ]]; then
  PATHS="${FILES%/*}/**"
fi

WORKFLOW_DIR=".github/workflows"
WORKFLOW_FILE="$WORKFLOW_DIR/generate-swatches.yml"

mkdir -p "$WORKFLOW_DIR"

cat > "$WORKFLOW_FILE" << EOF
name: Generate color swatches

on:
  push:
    branches: [main]
    paths:
      - ${PATHS}

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
          files: '${FILES}'
          out-dir: '${OUT_DIR}'
EOF

echo "Created $WORKFLOW_FILE"
