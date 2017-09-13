#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")" | tee /dev/null)"
cd "$DIR"


cd ../..

killtree() {
    local _pid=$1
    echo "$pid"
    for _child in $(ps -o pid --no-headers --ppid ${_pid}); do
        killtree ${_child}
    done
    sudo kill -TERM ${_pid}
}

if screen -list | grep -q "test-serve"; then
    echo closing screen test-serve...
    pid="$(screen -ls | grep "test-serve" | grep -o [0-9]* | head -1)"
    killtree $pid
fi

screen -wipe

echo reopening screen test-serve...
export BOLT_PORT=8081
screen -dmS test-serve node ./package/serve.js