#!/bin/bash
#Author: J.M.Montañana HLRS 2018
#Script for create an empty PHANTOM_repository DB.

#Copyright (C) 2018 University of Stuttgart
#
# 	Licensed under the Apache License, Version 2.0 (the "License");
# 	you may not use this file except in compliance with the License.
# 	You may obtain a copy of the License at
# 
# 		http://www.apache.org/licenses/LICENSE-2.0
# 
# 	Unless required by applicable law or agreed to in writing, software
# 	distributed under the License is distributed on an "AS IS" BASIS,
# 	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# 	See the License for the specific language governing permissions and
# 	limitations under the License.

################### Global Variables' Definition #############################
server="localhost"; 
appmanager_port="8500";
app=`basename $0`;
cd `dirname $0`;
source colors.sh;
################### Testing connectivity with the PHANTOM APP MANAGER server: #############
	source verify_connectivity.sh -s ${server} -port ${appmanager_port};
	conectivity=$?;
	if [ ${conectivity} -eq 1 ]; then
		echo "[ERROR:] Server \"${server}\" is unreachable on port \"${appmanager_port}\".";
		exit 1;
	fi;
##### Testing if the PHANTOM APP MANAGER server can access to the Elasticsearch Server ####
	HTTP_STATUS=$(curl -s http://${server}:${appmanager_port}/verify_es_connection);
	if [[ ${HTTP_STATUS} != "200" ]]; then
		echo "PHANTOM APP MANAGER Doesn't get Response from the ElasticSearch Server. Aborting.";
		exit 1;
	fi;
	# Look which kind of server is listening
	SERVERNAME=$(curl --silent http://${server}:${appmanager_port}/servername);
	if [[ ${SERVERNAME} != "PHANTOM Manager" ]]; then
		echo " The server found is not a PHANTOM Manager server. Aborting.";
		echo ${SERVERNAME};
		exit 1;
	fi;
# 6. ################## GET A NEW TOKEN FOR A REGISTERED USER ###################################
	echo -e "\n${LIGHT_BLUE}";
	echo "bash get_token.sh -e bob@example.com -pw 1234 -s ${server} -port ${appmanager_port} ;";
	read -p $'Press [Enter] key to run the script for \033[1;37mOBTAINING\033[1;34m a new token'; echo -ne "${NO_COLOUR}";
	newtoken=`bash get_token.sh -e bob@example.com -pw 1234 -s ${server} -port ${appmanager_port} ;` ;
	echo -e "the newtoken is:\n${newtoken}\n";
# 8. ################## TEST IF A TOKEN IS VALID OR NOT, this is useful when we don't know if the token has expired ####### 
	echo -e "\n${LIGHT_BLUE}";
	echo -e "OPTINAL test, not need to perform the verification";
	echo "bash verify_token.sh -t ${newtoken} -s ${server} -port ${appmanager_port} ;";
	read -p $'Press [Enter] key to run the script for \033[1;37mVERIFYING\033[1;34m a token'; echo -ne "${NO_COLOUR}";
	bash verify_token.sh -t ${newtoken} -s ${server} -port ${appmanager_port} ;
# 13. ################## TEST OF UPDATE, access must be accepted : 200 ##########
	echo -e "\n${LIGHT_BLUE}";
	echo -e "We are currently defining the project and the source in the json file !!!"
	echo "bash appman_update_status.sh -t ${newtoken} -sjp \"../web/devicestatus.json\" -s ${server} -port ${appmanager_port} ";
	read -p $'Press [Enter] key to run the script for \033[1;37mUPLOADING\033[1;34m a file with metadata'; echo -ne "${NO_COLOUR}";
	bash appman_update_status.sh -t ${newtoken} -sjp "../web/devicestatus.json" -s ${server} -port ${appmanager_port} ;
# 14. ################## TEST OF QUERY, access must be accepted : 200 ###### 
	echo -e "\n${LIGHT_BLUE}";
	echo "bash appman_get.sh -t ${newtoken} -device \"HLRS%20Raspberry%20pi3\" -s ${server} -port ${appmanager_port} ";
	read -p $'Press [Enter] key to run the script for \033[1;37mDOWNLOADING\033[1;34m a file from the REPOSITORY'; echo -ne "${NO_COLOUR}";
	bash appman_get.sh -t ${newtoken} -device "HLRS%20Raspberry%20pi3" -s ${server} -port ${appmanager_port} ;



