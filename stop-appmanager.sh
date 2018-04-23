#!/bin/bash

app=`basename $0`;
cd `dirname $0`;
cd server_code;
echo "> node";
if [ -f "appmanager.pid" ]; then
    PID=$(cat appmanager.pid)
    kill ${PID}
    rm -f appmanager.pid;
else
    echo "Couldn't find PID associated with node process.";
    echo "Please kill the service manually.";
fi;
echo -e "Done.\n";
