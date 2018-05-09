#!/bin/bash
# Script demostration of the USE of the PHANTOM APP MANAGER from the command line using curl
#Author: J.M.Montañana HLRS 2018
#  If you find any bug, please notify to hpcjmont@hlrs.de

#  Copyright (C) 2018 University of Stuttgart
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License. 
 
#0. ########## GLOBAL VARIABLES ###################################
	BASE_DIR=`pwd`;
	server="localhost"; 
	appmanager_port="8500";
	app=`basename $0`;
	BLUE="\033[0;34m";
	LIGHT_GRAY="\033[0;37m";
	LIGHT_GREEN="\033[1;32m";
	LIGHT_BLUE="\033[1;34m";
	LIGHT_CYAN="\033[1;36m";
	yellow="\033[1;33m";
	WHITE="\033[1;37m";
	RED="\033[0;31m";
	marron="\033[2;33m";
	NO_COLOUR="\033[0m";
	white="\033[0;0m";
	nyellow=$'\E[1;33m';
	cyan=$'\E[36m';
	reset=$'\E[0m';
	BC=$'\e[4m'; #underline
	EC=$'\e[0m'; #not underline
	cd `dirname $0`;
#0. #### Function Scripts definition ################################
	verify_reponse()
	{ 
		# $1 server
		# $2 port
		echo "Checking Response on port ${2} ...";
		let "j=0"; 
		HTTP_STATUS=$(curl --silent --output /dev/null --write-out "%{http_code}" http://${1}:${2});
		while [[ ${HTTP_STATUS} != "200" ]] && [ ${j} -lt 1 ] ; do 
			let "j += 1 "; sleep 1; 
			HTTP_STATUS=$(curl --silent --output /dev/null --write-out "%{http_code}" http://${1}:${2});
		done; 
		if [[ ${HTTP_STATUS} != "200" ]]; then
			echo "> Server is unreachable on port ${2}. Aborting."
			exit 1;
		fi;
		echo "Done. Response successfully found on port ${2}.";
		echo ;
	}
# 1. ################# CHECK if APP MANAGER server is running ###############
	echo "Checking APP MANAGER server ...";
	verify_reponse ${server} ${appmanager_port};
# 2. ################## CHECK if Elasticsearch is running ###############
	echo "Checking ElasticSearch ...";
	HTTP_STATUS=$(curl -s http://${server}:${appmanager_port}/verify_es_connection);
	if [[ ${HTTP_STATUS} != "200" ]]; then
		echo "> Not Response from the ElasticSearch Server. Aborting.";
		exit 1;
	fi;
	echo "Done. Response successfully found on ElasticSearch-server address.";
# 6. ################## GET A NEW TOKEN FOR A REGISTERED USER ###################################
	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Content-Type: text/plain\" -XGET http://${server}:${appmanager_port}/login?email=\"montana@abc.com\"\&pw=\"new\" --output token.txt\"";
	read -p $'Press [Enter] key to get an authorization \033[1;37mNEW TOKEN\033[1;34m for the example user'; echo -ne "${NO_COLOUR}";
	curl -s -H "Content-Type: text/plain" -XGET http://${server}:${appmanager_port}/login?email="montana@abc.com"\&pw="new" --output token.txt;
# 7. ################## SHOW THE TOKEN IN THE SCREEN ###################################
	echo -e "\n${LIGHT_BLUE}";
	echo "mytoken=\`cat token.txt\`; echo \${mytoken}";
	read -p $'Press [Enter] key to \033[1;37mSEE\033[1;34m the received \033[1;37mTOKEN\033[1;34m'; echo -ne "${NO_COLOUR}";
	mytoken=`cat token.txt;`; echo ${mytoken};
# 8. ################## TEST IF A TOKEN IS VALID OR NOT, this is useful when we not know if the token expired ####### 
	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -XGET ${server}:${appmanager_port}/verifytoken";
	read -p $'Press [Enter] key to \033[1;37mCHECK\033[1;34m if the \033[1;37mTOKEN\033[1;34m is valid or not'; echo -ne "${NO_COLOUR}";
	curl -s -H "Authorization: OAuth ${mytoken}" -XGET ${server}:${appmanager_port}/verifytoken;
# 9. ################## TEST ACCESS WITH A NOT VALID TOKEN, access must be rejected UNAUTHORIZED:401 #####################
	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Authorization: OAuth 12345678\" -XGET ${server}:${appmanager_port}/verifytoken";
	read -p $'Press [Enter] key to \033[1;37mCHECK\033[1;34m if dummy string is a valid \033[1;37mTOKEN\033[1;34m or not'; echo -ne "${NO_COLOUR}";
	curl -s -H "Authorization: OAuth 12345678" -XGET ${server}:${appmanager_port}/verifytoken;

	
	
# 12. ################## TEST OF register new device  ######## 
	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -H \"Content-Type: multipart/form-data\" -XPOST -F \"UploadJSON=@../web/device.json\" http://${server}:${appmanager_port}/register_new_device;";
	read -p $'Press [Enter] key to \033[1;37mUPLOAD\033[1;34m a \033[1;37mFILE\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -e "${NO_COLOUR}";
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/device.json" http://${server}:${appmanager_port}/register_new_device;
	#We sync, because it may start the next command before this operation completes.
	curl -s -XGET ${server}:${appmanager_port}/_flush > /dev/null;
	
#	reportmonitor.sh -r manager_db devices -n 20
# 12. ################## TEST OF UPDATE a device  ######## 
	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -H \"Content-Type: multipart/form-data\" -XPOST -F \"UploadJSON=@../web/device_mod.json\" http://${server}:${appmanager_port}/update_device;";
	read -p $'Press [Enter] key to \033[1;37mUPLOAD\033[1;34m a \033[1;37mFILE\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -e "${NO_COLOUR}";
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/device_mod.json" http://${server}:${appmanager_port}/update_device;
	#We sync, because it may start the next command before this operation completes.
	curl -s -XGET ${server}:${appmanager_port}/_flush > /dev/null;
		
# 	reportmonitor.sh -r manager_db devices -n 20

# 12. ################## TEST OF UPDATE a device status ######## 

	echo -e "\n${LIGHT_BLUE}";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -H \"Content-Type: multipart/form-data\" -XPOST -F \"UploadJSON=@../web/devicestatus.json\" http://${server}:${appmanager_port}/update_device_status;";
	read -p $'Press [Enter] key to \033[1;37mUPLOAD\033[1;34m a \033[1;37mFILE\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -e "${NO_COLOUR}";
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XPOST -F "UploadJSON=@../web/devicestatus.json" http://${server}:${appmanager_port}/update_device_status;
	#We sync, because it may start the next command before this operation completes.
	curl -s -XGET ${server}:${appmanager_port}/_flush > /dev/null;
		
# 	reportmonitor.sh -r manager_db devices_status -n 20
	

	
# 17. ######## TEST OF Query for a DEVICE ######## 
	echo -e "\n${LIGHT_BLUE}";
	echo "Now only QUERY on the filepath";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -XGET http://${server}:${appmanager_port}/query_device?device=\"HLRS%20Raspberry%20pi3\"";
	read -p $'Press [Enter] key to \033[1;37mRETRIEVE DEVICE\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -e "${NO_COLOUR}" ;
	curl -s -H "Authorization: OAuth ${mytoken}" -XGET http://${server}:${appmanager_port}/query_device?device="HLRS%20Raspberry%20pi3" ;

# 18. ##################   TEST   USER DEFINED QUERY ##########################
	echo -e "\n${LIGHT_BLUE}";
	echo "Now only QUERY on the filepath, we EXPLICITLY provide the query";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -H \"Content-Type: multipart/form-data\" -XGET http://${server}:${appmanager_port}/es_query_device?QueryBody=\"\\{\\\"query\\\":\\{\\\"bool\\\":\\{\\\"must\\\":\\[\\{\\\"match\\\":\\{\\\"device\\\":\\\"HLRS%20Raspberry%20pi3\\\"\\}\\}\\]\\}\\}\\}\"";
	read -p $'Press [Enter] key to \033[1;37mRETRIEVE DEVICE\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -ne "${NO_COLOUR}" ;
	curl -s -H "Authorization: OAuth ${mytoken}" -H "Content-Type: multipart/form-data" -XGET http://${server}:${appmanager_port}/es_query_device?QueryBody="\{\"query\":\{\"bool\":\{\"must\":\[\{\"match\":\{\"device\":\"HLRS%20Raspberry%20pi3\"\}\}\]\}\}\}";

# 19. ######## TEST OF Query for a DEVICE ######## 
	echo -e "\n${LIGHT_BLUE}";
	echo "Now only QUERY on the filepath";
	echo "curl -s -H \"Authorization: OAuth \${mytoken}\" -XGET http://${server}:${appmanager_port}/query_device_status?device=\"HLRS%20Raspberry%20pi3\"";
	read -p $'Press [Enter] key to \033[1;37mRETRIEVE DEVICE\033[1;34m with \033[1;37mVALID TOKEN\033[1;34m'; echo -e "${NO_COLOUR}" ;
	curl -s -H "Authorization: OAuth ${mytoken}" -XGET http://${server}:${appmanager_port}/query_device_status?device="HLRS%20Raspberry%20pi3" ;

#Warning seems that spaces in the parameters makes not get any reply from the server !!!
# Please replace such spaces by %20
