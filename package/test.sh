#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")")"
cd "$DIR"

echo
echo running prepare...
./test/prepare.sh

echo
echo running setup...
./test/setup.sh

echo
echo
echo waiting for neo4j to complete startup procedures...
./test/wait.sh

echo
echo
echo running tests proper...
./test/go.sh

echo
echo
echo running teardown...
./test/teardown.sh