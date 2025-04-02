#!/bin/bash

# Fix line endings
find docs -name "*.md" -exec sed -i '' -e '$a\' {} \;

# Fix common markdown linting issues
markdownlint docs/ --fix