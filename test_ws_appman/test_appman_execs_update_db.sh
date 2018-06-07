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

# 12. ################## TEST OF register new execution ######## 
	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -H \"Content-Type: multipart/form-data\" -XPOST -F \"UploadJSON=@../web/execstatus.json\" http://${server}:${appmanager_port}/register_new_exec;";
	read -p $'Press [Enter] key to \033[1;37mUPLOAD\033[1;34m a \033[1;37mFILE\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -e "${NO_COLOUR}";
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/execstatus.json" http://${server}:${appmanager_port}/register_new_exec;
	#We sync, because it may start the next command before this operation completes.
	curl -s -XGET ${server}:${appmanager_port}/_flush > /dev/null;
# 12. ################## TEST OF UPDATE a execution ######## 
	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -H \"Content-Type: multipart/form-data\" -XPOST -F \"UploadJSON=@../web/execstatus_mod.json\" http://${server}:${appmanager_port}/update_exec;";
	read -p $'Press [Enter] key to \033[1;37mUPLOAD\033[1;34m a \033[1;37mFILE\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -e "${NO_COLOUR}";
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/execstatus_mod.json" http://${server}:${appmanager_port}/update_exec;
	#We sync, because it may start the next command before this operation completes.
	curl -s -XGET ${server}:${appmanager_port}/_flush > /dev/null;
# 17. ######## TEST OF Query for a execution ######## 
	echo -e "\n${LIGHT_BLUE}";
	echo "Now only QUERY on the filepath";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -XGET http://${server}:${appmanager_port}/query_exec?app=\"HPC%20USE%20CASE\"";
	read -p $'Press [Enter] key to \033[1;37mRETRIEVE execution\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -e "${NO_COLOUR}" ;
	curl -s -H "Authorization: OAuth ${mytoken}" -XGET http://${server}:${appmanager_port}/query_exec?app="HPC%20USE%20CASE" ;

# NOTICE: When updating the new fields are added to the existing fields
# NOTICE: BUT, if you update a field which contains one or multiple values, it will replace the value/s of that field, the value/s of a field are not merged on an update!!

