#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")")"
cd "$DIR"
cd ..

if [ ! -e node_modules/package ]; then
    echo attaching package as linked module...
    ln -s ../ node_modules/package
fi
if [ ! -e node_modules/api ]; then
    echo attaching api as linked module...
    ln -s ../api node_modules/api
fi
if [ ! -e node_modules/test ]; then
    echo attaching test as linked module...
    ln -s ../test node_modules/test
fi