#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
if node "$DIR/dev-supported-version.js"
then
    npm run build
else
    node "$DIR"/../test/run-tests.js
fi