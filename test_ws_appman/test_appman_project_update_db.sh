#!/bin/bash
#Author: J M Montanana
# This scripts :
# * registers and query an example of a project with few tasks
# * updates some fields in the he previous project registered, and adds also some new field
#
# If user is suscribed to a project, then the user will get a copy of the uploading json
#

#. ################### global variables:
	appmanager_port=8500;
	server=localhost;
	source colors.sh;
# . ################## GET A NEW TOKEN FOR A REGISTERED USER ###################################
	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Content-Type: text/plain\" -XGET http://${server}:${appmanager_port}/login?email=\"montana@abc.com\"\&pw=\"new\" --output token.txt\"";
	read -p $'Press [Enter] key to get an authentication \033[1;37mNEW TOKEN\033[1;34m for the example user'; echo -ne "${NO_COLOUR}";
	#curl -s -H "Content-Type: text/plain" -XGET http://${server}:${appmanager_port}/login?email="montana@abc.com"\&pw="new" --output token.txt;
	curl -s -H "Content-Type: text/plain" -XGET http://${server}:${appmanager_port}/login?email="hpcjmont@hlrs.de"\&pw="2795572358" --output token.txt;

# . ################## SHOW THE TOKEN IN THE SCREEN ###################################
	echo -e "\n${LIGHT_BLUE}";
	echo "mytoken=\`cat token.txt\`; echo \${mytoken}";
	read -p $'Press [Enter] key to \033[1;37mSEE\033[1;34m the received \033[1;37mTOKEN\033[1;34m'; echo -ne "${NO_COLOUR}";
	mytoken=`cat token.txt;`; echo "token is ${mytoken}";

#. ############################# UPLOAD A FILE ###############################
	echo -e "\n\n******************\nREGISTER PROJECT 1" 
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/example_manager_task.json" http://${server}:${appmanager_port}/register_new_project

	echo -e "\n\nQUERY PROJECT";
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XGET http://${server}:${appmanager_port}/query_task?project=demo_hpc

	echo -e "\n\n******************\nREGISTER PROJECT 2"
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/example_manager_task3.json" http://${server}:${appmanager_port}/update_project_tasks

	echo -e "\n\nQUERY PROJECT";
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XGET http://${server}:${appmanager_port}/query_task?project=demo_surveillance


	echo -e "\n\n******************\nREGISTER PROJECT 1 with other values"
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/example_manager_task2.json" http://${server}:${appmanager_port}/update_project_tasks

	echo -e "\n\nQUERY PROJECT";
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XGET http://${server}:${appmanager_port}/query_task?project=demo_hpc

	echo -e "\n\n";

# NOTICE: When updating the new fields are added to the existing fields
# NOTICE: BUT, if you update a field which contains one or multiple values, it will replace the value/s of that field, the value/s of a field are not merged on an update!!

