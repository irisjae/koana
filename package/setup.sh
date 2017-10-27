#!/usr/bin/env bash
DIR="$(sudo dirname "$(readlink -f "$0")")"
cd "$DIR"
cd ..

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
echo "checking java (for neo4j)..."
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
    echo trying to update npm...
    npm install -g npm
fi

echo
echo
echo checking cordova...
if npm list -g cordova@7.0.1; then
    echo cordova already installed
else
    echo trying install cordova...
    npm install -g cordova@7.0.1
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