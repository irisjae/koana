#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")" | tee /dev/null)"
cd "$DIR"

./teardown.sh

if screen -list | sed s/test-neo4j// | grep -q "neo4j"; then
    echo closing screen neo4j to free RAM ":(("...
    screen -S neo4j -X quit
fi
if sudo lsof -t -i:8080; then 
    echo killing any :8080 process...
    kill $(sudo lsof -t -i:8080)
fi