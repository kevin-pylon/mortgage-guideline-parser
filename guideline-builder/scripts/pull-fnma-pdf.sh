#!/usr/bin/env bash
set -e

PROJECT_ROOT="$1"

if [ "${PYLON_ENV}" = "ci" ]; then
    echo "ERROR: pull-fnma should not be called in CI environment"
    echo "This command downloads PDFs from S3 and should only run locally"
    exit 1
fi

if [ -z "$PROJECT_ROOT" ]; then
    echo "ERROR: Project root directory not provided"
    echo "Usage: $0 <project-root>"
    exit 1
fi

mkdir -p "$PROJECT_ROOT/guidelines"

aws s3api get-object \
    --bucket pylon-build-artifacts \
    --key fnma_selling_guide \
    "$PROJECT_ROOT/guidelines/fnma_selling_guide.pdf" \
    --no-cli-pager