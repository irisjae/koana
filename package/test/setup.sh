#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")" | tee /dev/null)"
cd "$DIR"

cd ../..
echo cloning test database...
cp -r ./database/prototest ./database/test
echo opening screen test-neo4j...
screen -dmS test-neo4j sudo ./database/test/bin/neo4j console

#export BOLT_PORT=7687
#node ./api/importer.js

echo opening screen test-serve...
export BOLT_PORT=7687
screen -dmS test-serve node ./package/serve.js