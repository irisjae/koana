#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")")"
cd "$DIR"
cd ..

if [ -e node_modules/package ]; then
    echo detaching linked package module...
    rm node_modules/package
fi
if [ -e node_modules/api ]; then
    echo detaching linked api module...
    rm node_modules/api
fi
if [ -e node_modules/test ]; then
    echo detaching linked test module...
    rm node_modules/test
fi