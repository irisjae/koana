#!/usr/bin/env bash
DIR="$(sudo dirname $(readlink -f $0))"
cd "$DIR"

screen -wipe
if ! screen -list | grep -q "neo4j"; then
    echo Restarting screen neo4j...
    screen -dmS neo4j sudo neo4j console
fi

. ~/.nvm/nvm.sh
nvm use 7.1.0
node --version
node serve.js