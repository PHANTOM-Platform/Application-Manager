#!/bin/bash
#Author: J M Montanana
# This scripts :
#  * generates the manager app nodejs
#  * creates a new DB and register an user
#  * registers and query an example of a project with few tasks
#  * updates some fields in the he previous project registered, and adds also some new field
#
#  If user is suscribed to a project, then the user will get a copy of the uploading json
#

#global variables:
mytoken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtb250YW5hQGFiYy5jb20iLCJpYXQiOjE1MjQwMzg1NTQsImV4cCI6MTUyNjYzMDU1NH0.1dB8D3E3_L1b6BlRWyTc78H4QvwlJ9mtVt0wNY5V-Uo
appmanager_port=8500;
server=localhost;

bash genera_manager.sh;
bash ../start-manager.sh;

# bash ../manager_api_command_line/demo_admin_appman_curl.sh
#curl -s -XGET ${server}:${appmanager_port}/_flush > /dev/null;

echo -e "\n\n******************\nREGISTER PROJECT 1"
curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/example_manager_task.json" http://${server}:${appmanager_port}/register_new_project

echo -e "\n\nQUERY PROJECT";
curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XGET  http://${server}:${appmanager_port}/query_task?project=demo_hpc

echo -e "\n\n******************\nREGISTER PROJECT 2"
curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/example_manager_task3.json" http://${server}:${appmanager_port}/update_project_tasks

echo -e "\n\nQUERY PROJECT";
curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XGET  http://${server}:${appmanager_port}/query_task?project=demo_surveillance


echo -e "\n\n******************\nREGISTER PROJECT 1 with other values"
curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/example_manager_task2.json" http://${server}:${appmanager_port}/update_project_tasks

echo -e "\n\nQUERY PROJECT";
curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XGET  http://${server}:${appmanager_port}/query_task?project=demo_hpc

echo -e "\n\n";
# NOTICE: When updating the new fields are added to the existing fields
# NOTICE: BUT, if you update a field which contains one or multiple values, it will replace the value/s of that field, the value/s of a field are not merged on an update!!

