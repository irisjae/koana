#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")" | tee /dev/null)"
cd "$DIR"
cd ../..

node ./test/case.js

export BOLT_PORT=7687
shopt -s globstar
#tap test/**/*.js
node test/set/parent | tap -