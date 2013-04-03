if [ -z "$1" ]; then
    echo "Usage: ./sync-resources.sh release/type"
    echo
    echo "Example: ./sync-resources.sh debug/html5"
    exit 1
fi

if [ -d bin/$1 ]; then
    cp -r bin/$1/* bin/resources/
    git clean -fdx bin/resources/
fi
mkdir -p bin/$1
cp -r bin/resources/* bin/$1/
