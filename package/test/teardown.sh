#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")" | tee /dev/null)"
cd "$DIR"


killtree() {
    local _pid=$1
    echo "$pid"
    for _child in $(ps -o pid --no-headers --ppid ${_pid}); do
        killtree ${_child}
    done
    sudo kill -TERM ${_pid}
}

if screen -list | grep -q "test-neo4j"; then
    echo closing screen test-neo4j...
    pid="$(screen -ls | grep "test-neo4j" | grep -o [0-9]* | head -1)"
    killtree $pid
fi

if screen -list | grep -q "test-serve"; then
    echo closing screen test-serve...
    pid="$(screen -ls | grep "test-serve" | grep -o [0-9]* | head -1)"
    killtree $pid
fi

screen -wipe

cd ../..
if [ -e ./temp/test/ ]; then
    echo wiping test database...
    sudo rm -rf ./temp/test/
fi