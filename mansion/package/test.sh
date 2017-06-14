#!/usr/bin/env bash
DIR=sudo dirname $(readlink -f $0)
cd "$DIR"

. ~/.nvm/nvm.sh
nvm use 7.1.0

node --version

screen -wipe
if screen -list | grep -q "neo4j"; then
    echo Closing screen neo4j...
    screen -S "neo4j" -X quit
fi

if screen -list | grep -q "test-neo4j"; then
    echo Screen test-neo4j already open
else
    echo Opening screen test-neo4j...
    screen -dmS test-neo4j sudo neo4j console
fi


cd ..
tap test/**/*.js