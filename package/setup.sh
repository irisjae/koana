#!/usr/bin/env bash
DIR=sudo dirname $(readlink -f $0)
cd "$DIR"

echo
echo
echo checking screen...
if dpkg-query -l screen; then
    echo screen already installed
else
    echo trying install screen...
    sudo apt-get update
    sudo apt-get install screen
fi

echo
echo
echo checking neo4j...
if dpkg-query -l neo4j; then
    echo neo4j already installed
else
    if type -p java; then
        echo found java executable in PATH
        _java=java
    elif [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]]; then
        echo found java executable in JAVA_HOME     
        _java="$JAVA_HOME/bin/java"
    else
        echo no java
        exit 1
    fi
    
    version=$("$_java" -version 2>&1 | awk -F '"' '/version/ {print $2}')
    echo version "$version"
    if ! [[ "$version" > "1.8" ]]; then
        echo trying install java 8...
        sudo add-apt-repository ppa:webupd8team/java
        sudo apt-get update
        sudo apt-get install oracle-java8-installer
    else
        echo has java 8
    fi
    
    echo trying installing neo4j...
    wget -O - https://debian.neo4j.org/neotechnology.gpg.key | sudo apt-key add -
    echo 'deb http://debian.neo4j.org/repo stable/' | sudo tee -a /etc/apt/sources.list.d/neo4j.list
    sudo apt-get update
    sudo apt-get install neo4j
    sudo sed -i -E s/#\?dbms.connector.bolt.tls_level=.\+/dbms.connector.bolt.tls_level=OPTIONAL/ /etc/neo4j/neo4j.conf
    sudo sed -i -E s/#\?dbms.connector.bolt.listen_address=.\+/dbms.connector.bolt.listen_address=:8081/ /etc/neo4j/neo4j.conf
    sudo sed -i -E s/#\?dbms.connector.http.listen_address=.\+/dbms.connector.http.listen_address=:8082/ /etc/neo4j/neo4j.conf
    sudo sed -i -E s/#\?dbms.security.auth_enabled=.\+/dbms.security.auth_enabled=false/ /etc/neo4j/neo4j.conf
    sudo sed -i -E s/#\?dbms.memory.heap.initial_size=.\+/dbms.memory.heap.initial_size=512m/ /etc/neo4j/neo4j.conf
    sudo sed -i -E s/#\?dbms.memory.heap.max_size=.\+/dbms.memory.heap.max_size=512m/ /etc/neo4j/neo4j.conf
    sudo sed -i -E s/#\?dbms.connector.https.enabled=.\+/dbms.connector.https.enabled=false/ /etc/neo4j/neo4j.conf
    sudo sed -i -E s/#\?dbms.connectors.default_listen_address=.\+/dbms.connectors.default_listen_address=0.0.0.0/ /etc/neo4j/neo4j.conf
fi

echo
echo
echo checking nvm version...
. ~/.nvm/nvm.sh
nvm install 7.1.0
nvm alias default node

echo
echo
echo checking npm version...
if ! npm outdated -g npm | grep -z npm; then
    echo npm is up to date
else
    echo trying to update npm
    npm install -g npm
fi

echo
echo
if [ -e node_modules/package ]; then
    echo temp remove linked package module...
    rm node_modules/package
fi
if [ -e node_modules/api ]; then
    echo temp remove linked api module...
    rm node_modules/api
fi

echo
echo
echo checking cordova...
if npm list -g cordova; then
    echo cordova already installed
else
    echo trying install cordova...
    npm install -g cordova
    if cordova platform | grep -z "Installed.*browser.*Available"; then
        echo platform browser installed, removing outdated...
        cordova platform rm browser
    fi    
    if cordova platform | grep -z "Installed.*android.*Available"; then
        echo platform android installed, removing outdated...
        cordova platform rm android
    fi    
    if cordova platform | grep -z "Installed.*ios.*Available"; then
        echo platform ios installed, removing outdated...
        cordova platform rm ios
    fi    
    cordova platform add browser android ios
fi

echo
echo
echo installing npm packages...
npm install

echo
echo
if [ ! -e node_modules/package ]; then
    echo linking package as module...
    ln -s ../ node_modules/package
fi
if [ ! -e node_modules/api ]; then
    echo linking api as module...
    ln -s ../api node_modules/api
fi