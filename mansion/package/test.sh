DIR=sudo dirname $(readlink -f $0)
cd "$DIR"

. ~/.nvm/nvm.sh
nvm use 7.1.0

node --version

cd ..
tap test/*.js