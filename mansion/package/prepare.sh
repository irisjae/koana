DIR=sudo dirname $(readlink -f $0)
cd "$DIR"

echo
echo
echo checking nvm version...
. ~/.nvm/nvm.sh
nvm install 7.1.0

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
echo checking cordova...
if npm list -g cordova; then
    echo cordova already installed
else
    echo trying install cordova...
    sudo npm install -g cordova
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
    sudo apt-get install neo4j=3.2.2
fi