#!/bin/bash
#Script for create an empty PHANTOM APP MANAGER
#Author: J.M.Montañana HLRS 2018
#  If you find any bug, please notify to hpcjmont@hlrs.de

#Copyright (C) 2018 University of Stuttgart
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
# 
#      http://www.apache.org/licenses/LICENSE-2.0
# 
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

###################   Global Variables' Definition #############################
server="localhost"; 
appmanager_port="8500";
app=`basename $0`;
cd `dirname $0`;
source colors.sh;
################ Parse of the input parameters #################################
if [ $# -ne 0 ]; then
	nuevo=true;
	last="";
	for i do
		if [ "$nuevo" = true ]; then
			if [ "$last" = "-s" ] || [ "$last" = "-S" ]; then
				server=$i;
				nuevo=false;
			elif [ "$last" = "-port" ] || [ "$last" = "-PORT" ]; then
				appmanager_port=$i;
				nuevo=false;  
			elif [ "$i" = "-h" ] || [ "$i" = "-H" ]; then
				echo -e "${yellow}Script for CREATING the APP MANAGER DATABASE and the FOLDER for storing files${reset}";
				echo -e "${yellow}Syntax ${app}:${reset}";
				echo -e "${yellow}   Optional fields:${reset}";
				echo -e "${yellow}      Server [-s phantom.com] ${reset}";
				echo -e "${yellow}      Port [-port 8500] ${reset}";
				echo -e "${yellow}   Help [--help] to get this help.${reset}";
				echo -e "\n${yellow} Example of use  with default values server=localhost port=9400:\n     ${app} ;${reset}";
				echo -e "\n${yellow} Example of use:\n     ${app} -s localhost -port 9400${reset}";
				exit 0
			elif [ "$last" != "" ]; then
				echo "error de sintaxis" $last ".";
				exit;
			else
				last=$i;
			fi;
		else
			nuevo=true;
			last=$i;
		fi;
	done; 
fi;
################### Testing connectivity with the PHANTOM APP MANAGER server: #############
	source verify_connectivity.sh -s ${server} -port ${appmanager_port};
	conectivity=$?;
	if [ ${conectivity} -eq 1 ]; then
		echo "[ERROR:] Server \"${server}\" is unreachable on port \"${appmanager_port}\".";
		exit 1;
	fi;
##### Testing if the PHANTOM APP MANAGER server can access to the Elasticsearch Server ####
	HTTP_STATUS=$(curl -s --silent --output /dev/null --write-out "%{http_code}" http://${server}:${appmanager_port}/verify_es_connection);
	if [[ ${HTTP_STATUS} != "200" ]]; then
		echo "PHANTOM APP MANAGER Doesn't get Response from the ElasticSearch Server. Aborting.";
		echo "[Log:] HTTP_STATUS: ${HTTP_STATUS}";
		exit 1;
	fi;
######## Creating a new empty database ###################################################
HTTP_STATUS=$(curl -XGET --silent --output /dev/null --write-out "%{http_code}" http://${server}:${appmanager_port}/new_db);
######## Screen report of the Result #####################################################
if [[ ${HTTP_STATUS} == "200" ]]; then
	echo "[Log:] Success.";
elif [[ ${HTTP_STATUS} == "400" ]]; then
	echo "[Error:] Can not create DB because already exists.";
else #this report is for the case we may get any other kind of response
	echo "[Log:] HTTP_STATUS: ${HTTP_STATUS}";
fi;
