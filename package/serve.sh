#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")")"
cd "$DIR"

screen -wipe
if screen -list | sed s/test-neo4j// | grep -q "neo4j"; then
    echo screen neo4j already open
else
    echo restarting screen neo4j...
    screen -dmS neo4j sudo ../database/dev/bin/neo4j console
fi

. ~/.nvm/nvm.sh
nvm use 7.1.0
node --version
node serve.js