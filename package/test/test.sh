#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")" | tee /dev/null)"
cd "$DIR"
cd ../..

export BOLT_PORT=8081
shopt -s globstar
#tap test/**/*.js
node test/test | tap -