#!/usr/bin/env node
// Author: J.M.Montañana HLRS 2018
// 	If you find any bug, please notify to hpcjmont@hlrs.de
// 
// 	Copyright (C) 2018 University of Stuttgart
// 
// 		Licensed under the Apache License, Version 2.0 (the "License");
// 		you may not use this file except in compliance with the License.
// 		You may obtain a copy of the License at
// 	
// 		http://www.apache.org/licenses/LICENSE-2.0
// 	
// 		Unless required by applicable law or agreed to in writing, software
// 		distributed under the License is distributed on an "AS IS" BASIS,
// 		WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 		See the License for the specific language governing permissions and
// 		limitations under the License.
process.title = 'PHANTOM-Manager-server';

//****************** VARIABLES OF THE REPOSITORY SERVER, MODIFY DEPENDING ON YOUR DEPLOYMENT *****
	const es_servername = 'localhost';
	const es_port = 9400;
	const ips = ['::ffff:127.0.0.1','127.0.0.1',"::1"];
	const SERVERNAME ="PHANTOM Manager (APP + Resources + Executions)";
	const SERVERPORT = 8500;
	const SERVERDB = "manager_db";
	
	// This will be allocated in the home folder of the user running nodejs !! os.homedir()+File_Server_Path
//******************** PACKAGES AND SOME GLOBAL VARIABLES ************
	const express 		= require('express');
	var app = express(); 
	const fileUpload 	= require('express-fileupload');
	var fs 				= require('fs');
	var dateFormat 		= require('dateformat');
	const os 			= require('os'); 
	const contentType_text_plain = 'text/plain';
//********************* SUPPORT JS file, with variable defs *********
	const colours 			= require('./colours');
//********************* SUPPORT JS file, for DB functionalities *****
	const MetadataModule 	= require('./support-metadata'); 
	const UsersModule 		= require('./support-usersaccounts');
	const LogsModule 		= require('./support-logs');
	const CommonModule 		= require('./support-common');
	const supportmkdir 		= require('./mkdirfullpath'); 
	const TasksModule		= require('./support-tasks-man');
	//*********************** SUPPORT JS file, for TOKENS SUPPORT *******
	var bodyParser	= require('body-parser');
	var cors		= require('cors');
	var auth		= require('./token-auth');
	var middleware	= require('./token-middleware');
	var expressWs 		= require('express-ws')(app); 
	var app = expressWs.app;
//*******************************************************************
//********************  VARIABLES FOR WSockets **********************
	//*** STORAGE OF USERS
	const max_users=5; 
	var totalusers=0;
	var user_ids = new Array(max_users ); // 6 possible users id
	var user_conn = new Array(max_users ); // the connetion of each user
	
	var user_ip = new Array(max_users ); // the connetion of each user
	var user_index = new Array(max_users ); // the connetion of each user
	
//*** STORAGE OF PROJECT CONTENTS
	const max_projects= 10;
	const max_mensages=4;
	var totalmensages= [max_projects];
	for (var i = 0; i < max_projects; i++) 
		totalmensages[i]=0;
	var ProjectContents = new Array(max_projects,max_mensages); //10 projects,  stack of 4 contents
	
//*** STORAGE OF SUSCRIPTIONS 
	const max_suscrip=6;
	var totalsuscriptions= [max_users]; //for each user
	for (var i = 0; i < max_users; i++) 
		totalsuscriptions[i]=0;
	var ProjectSubscriptions = new Array(max_users,6); // 6 possible users, stack of 4 proj suscr 
	var clients = [ ];// list of currently connected clients (users) 

//****************************************************
//**********************************************************
//This function removes double quotation marks if present at the beginning and the end of the input string
function remove_quotation_marks(input_string){
	if(input_string.charAt(0) === '"') {
		input_string = input_string.substr(1);
	}
	if(input_string.length>0){
	if(input_string.charAt(input_string.length-1) === '"') {
		input_string = input_string.substring(0, input_string.length - 1); 
	}}
	return (input_string);
}	

function is_defined(variable) {
	return (typeof variable !== 'undefined');
}
//*********************************************************************
function find_param(body, query){	
	try{
		if (body != undefined){ //if defined as -F parameter
			return body ;
		}else if (query != undefined){ //if defined as ? parameter
			return query;
		}
	}catch(e){ 
		if (query != undefined){ //if defined as ? parameter
			return query;
		}
	} 
	return undefined ;
}
//*********************************************************************
//report on the screen the list of fields, and values
function consolelogjson(JSONstring ){
	var jsonobj = JSON.parse(JSONstring);
	var keys = Object.keys(jsonobj);
	console.log("total keys "+keys.length);
	for (var i = 0; i < keys.length; i++) {
		console.log("name: \""+Object.getOwnPropertyNames(jsonobj)[i]+"\" \t\tvalue: \""+ jsonobj[keys[i]]+ "\"");
		var labeltxt=Object.getOwnPropertyNames(jsonobj)[i];
		console.log("pos: " + jsonobj.indexOf(labeltxt));
	}
}
//*********************************************************************	
//the purpose is to remove the fields/properties path,path_length, filename,filename_length, if present.
//and generate thos fields/properties from the input parameters
function update_filename_path_on_json(JSONstring,filename,path){ 
	var new_json = {  } 
	var jsonobj = JSON.parse(JSONstring);
	var keys = Object.keys(jsonobj); 
	for (var i = 0; i < keys.length; i++) {
		var label=Object.getOwnPropertyNames(jsonobj)[i];
		label=label.toLowerCase();
		if((label != 'path') && (label != 'filename') && (label != 'path_length') && (label != 'filename_length'))
		new_json[label]=jsonobj[keys[i]];	//add one property 
	} 
	new_json['path']		=path;
	new_json['path_length']	=path.length; //label can not contain points '.' !
	new_json['filename']	=filename;
	new_json['filename_length']=filename.length;
	return new_json;
}

function get_source_project_json(JSONstring){  
	var myres = { source: "", project: "" };
	var jsonobj = JSON.parse(JSONstring);
	var keys = Object.keys(jsonobj); 
	for (var i = 0; i < keys.length; i++) {
		var label=Object.getOwnPropertyNames(jsonobj)[i];
		label=label.toLowerCase();
		if(label == 'source')
			myres.source=jsonobj[keys[i]];		
		if(label == 'project')
			myres.project=jsonobj[keys[i]];
	} 
	return myres;
}
//*********************************************************************	
function generate_json_example(){ 
	var Employee = {
		firstname: "Pedro",
		lastname: "Picapiedra"
	} 
	console.log(Employee);
	delete Employee.firstname; //delete one property
	var label='age';
	Employee[label]="32";		//add one property
	console.log(Employee);
}
//*********************************************************************
//report on the screen the list of fields, and values
function get_value_json(JSONstring,label){
	var jsonobj = JSON.parse(JSONstring);
	var keys = Object.keys(jsonobj); 
	var i=0;
	var myres = {value: undefined, pos: undefined }; 
	while (i < keys.length) {
		if(Object.getOwnPropertyNames(jsonobj)[i]==label){
			myres.pos=i;
			myres.value=jsonobj[keys[i]];
			return (myres);
		}
		i++;
	}
	return (myres);
}
//**********************************************************
function validate_parameter(parameter,label,currentdate,user,address){
	var message_error = "DOWNLOAD Bad Request missing "+label;  
	if (parameter != undefined){  
		parameter = remove_quotation_marks(parameter);
		if (parameter.length > 0)
			return(parameter); 
	} 
	resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB,400,address,message_error,currentdate, user );
	return undefined;
}

//*********************************************************
function retrieve_file(filePath,req){
	var fs = require('fs');
	var path = require('path');
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.html':
			contentType = 'text/html';
			break;			
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.json':
			contentType = 'application/json';
			break;
		case '.png':
			contentType = 'image/png';
			break;
		case '.jpg':
			contentType = 'image/jpg';
			break;
		case '.wav':
			contentType = 'audio/wav';
			break;
	}
	fs.readFile(filePath, function(error, content) {
		if (error) {
			if(error.code == 'ENOENT'){
				fs.readFile('./404.html', function(error, content) {
					res.writeHead(404, { 'Content-Type': contentType });
					res.end(content, 'utf-8');
				});
			} else {
				res.writeHead(500);
				res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
				res.end(); 
			}
		} else {
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content, 'utf-8');
		}
	});
}
//**********************************************************
var middleware = require('./token-middleware');

// Access to private content only if autenticated, using an authorization token
app.get('/verifytoken',middleware.ensureAuthenticated, function(req, res) { 
// 	console.log("   " +colours.FgYellow + colours.Bright + " request from IP:" + req.connection.remoteAddress + colours.Reset); 
		var message = "The token is valid !!!.\n"
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end(message, 'utf-8');
} );
//********************************************************** 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(fileUpload()); 
//**********************************************************
/* GET home page. */
app.get('/', function(req, res, next) {	
	var json = {};
	json.message = SERVERNAME + "server is up and running."
	json.release = req.app.get('version');
	json.versions = [ 'v1' ];
	json.current_time = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l");
	res.json(json);
});
//**********************************************************
app.get('/upload_file.html', function(req, res) {
	var filePath = 'web/upload_file.html';
	retrieve_file(filePath,req);
});
//**********************************************************
app.get('/upload_file.html', function(req, res) { 
	var filePath = 'web/upload_file.html';
	retrieve_file(filePath,req);
});
//*******************************
app.get('/download_file.html', function(req, res) { 
	var filePath = 'web/download_file.html';
	retrieve_file(filePath,req);
});
//*******************************
app.get('/examplec.json', function(req, res) { 
	var filePath = 'web/examplec.json';
	retrieve_file(filePath,req);
});
//*******************************
app.get('/query_metadata.html', function(req, res) { 
	var filePath = 'web/query_metadata.html';
	retrieve_file(filePath,req);
});
// Path only accesible when Authenticated
app.get('/private',middleware.ensureAuthenticated, function(req, res) {
	var message = "\n\nAccess to restricted content !!!.\n\n"
		res.writeHead(200, { 'Content-Type': contentType_text_plain});
		res.end(message, 'utf-8');
});
//**********************************************************
app.get('/verify_es_connection', function(req, res) {	
	var testhttp = require('http'); 
	testhttp.get('http://'+es_servername+':'+es_port+'/', function(rescode) { 
// 		var int_code= parseInt( rescode.statusCode, 10 ); 
		res.writeHead(rescode.statusCode, { 'Content-Type': contentType_text_plain });
		res.end(""+rescode.statusCode, 'utf-8');
	}).on('error', function(e) {
		console.error(e);
		res.writeHead(000, { 'Content-Type': contentType_text_plain });
		res.end("000", 'utf-8');		
	}); 
});
//**********************************************************
app.get('/drop_db', function(req, res) {
	"use strict";
	var resultlog ;
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l");
	console.log("\n[LOG]: Deleting Database"); 
	console.log("   " +colours.FgYellow + colours.Bright + " request from IP:" + req.connection.remoteAddress + colours.Reset);
	if(( req.connection.remoteAddress!= ips[0] ) &&( req.connection.remoteAddress!=ips[1])&&( req.connection.remoteAddress!=ips[2])){
		console.log(" ACCESS DENIED from IP address: "+req.connection.remoteAddress);
		res.writeHead(403, {"Content-Type": contentType_text_plain});
		res.end("\n403: FORBIDDEN access from external IP.\n");		
		var messagea = "Deleting Database FORBIDDEN access from external IP.";
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 403,req.connection.remoteAddress,messagea,currentdate,""); 
		return ;
	}
	var searching = MetadataModule.drop_db(es_servername+":"+es_port, SERVERDB );
	searching.then((resultFind) => {  
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(resultFind+"\n"); 
// 		 we can not register nothing after delete the DB !!! 
	},(resultReject)=> {
		console.log("log: Bad Request: " + resultReject); 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("\n400: Bad Request "+resultReject+"\n"); 
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400,req.connection.remoteAddress,"Bad Request "+resultReject,currentdate,"");
	} );
});
//**********************************************************
app.get('/new_db', function(req, res) {
	"use strict"; 
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l");
	var devicemapping = {
		"devices": {
			"properties": {
				"name": {
					"type": "string",
					"index": "analyzed"
				},
				"cpu_type": { 
					"type": "string",
					"index": "analyzed"
				},
				"cpu_cores": { //Example: 4
					"type": "short"
				},
				"ram_size_bytes": { //Example 1gb_ram 1073741824
					"type": "long"
				},
				"gpu_type": { 
					"type": "string", //Example: NA, Nvidia GTX960
					"index": "analyzed"
				},
				"gpu_ram": { 
					"type": "string", //Example: NA, Nvidia GTX960
					"index": "analyzed"
				},
				"gpu_type": { 
					"type": "string", //Example: NA, Nvidia GTX960
					"index": "analyzed"
				},		
				"fpga_type": {
					"type": "string",
					"index": "analyzed"
				},
				"fpga_logic_gates": { 
					"type": "long"
				}
			} 
		}
	}
	var statusmapping = {			 
		"devices_status": {
			"properties": {
				"cpu_load": { // the used percentage of the cpu 
					"type": "float"
				},
				"ram_load": {  // the used percentage of the available ram 
					"type": "float"
				},
				"swap_load": { // the used percentage of the available swap
					"type": "string",
					"index": "not_analyzed" //for avoid hacking when using incomplete pw.
				},
				"network_load": { // as b/s
					"type": "long"
				},
				"io_load": { // as b/s
					"type": "long"
				},
				"timestamp": { // as b/s
					"type": "date",
					"store": "yes",
					"format": "yyyy-MM-dd'T'HH:mm:ss.SSS",
					"index": "analyzed"
				}		
			}
		}
	}	
	var metadatamapping = {
		"metadata": {
			"properties": {
				"path": {
					"type": "string",
					"index": "analyzed"
				},
				"path_length": { 
					"type": "short"
				},
				"user_owner": {//of the file, user_id is the user email
					"type": "string",
					"index": "analyzed"
				},
				"name": {//of the application
					"type": "string",
					"index": "analyzed"
				},
				"filename": {
					"type": "string",
					"index": "analyzed"
				},
				"filename_length": { 
					"type": "short"
				}
			} 
		}
	}
	var usersmapping = {			 
		"users": {
			"properties": {
				"email": {
					"type": "string",
					"index": "not_analyzed" //for avoid hacking when using incomplete email addresses.
				},
				"email_length": {
					"type": "short"
				},
				"password": {
					"type": "string",
					"index": "not_analyzed" //for avoid hacking when using incomplete pw.
				},
				"password_length": {
					"type": "short"
				}
			}
		}
	}
	var tokensmapping = { 
		"tokens":{
			"properties": {
				"user_id": {
					"type": "string"
				},
				"generationtime": {
					"type": "date",
					"store": "yes",
					"format": "yyyy-MM-dd'T'HH:mm:ss.SSS",
					"index": "analyzed"
				},
				"expirationtime": {
					"type": "date",
					"store": "yes",
					"format": "yyyy-MM-dd'T'HH:mm:ss.SSS",
					"index": "analyzed"
				}
			}
		}
	} 
	var logsmapping = { 
		"logs":{
			"properties": {
				"code": {
					"type": "string"
				},
				"ip": {
					"type": "string"
				},
				"message": {
					"type": "string"
				},
				"date": { 
					"type": "date",
					"store": "yes",
					"format": "yyyy-MM-dd'T'HH:mm:ss.SSS",
					"index": "analyzed"
				}
			}
		}
	} 
	var resultlog ;  
	var searching = MetadataModule.new_db(es_servername+":"+es_port,SERVERDB );
	searching.then((resultFind) => {		
		var searchingb = MetadataModule.new_mapping(es_servername+":"+es_port,SERVERDB, "metadata", metadatamapping);
		searching.then((resultFindb) => {
			var searchingc = MetadataModule.new_mapping(es_servername+":"+es_port,SERVERDB, "users", usersmapping);
			searching.then((resultFindc) => {
				var searchingd = MetadataModule.new_mapping(es_servername+":"+es_port,SERVERDB, "tokens", tokensmapping);
				searching.then((resultFindd) => { 
					var searchinge = MetadataModule.new_mapping(es_servername+":"+es_port,SERVERDB, "logs", logsmapping);
					searching.then((resultFinde) => {
						res.writeHead(200, {"Content-Type": "application/json"});
						res.end(resultFinde+"\n"); 
						resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 200,req.connection.remoteAddress,"DB successfully created",currentdate,""); 
					},(resultRejecte)=> { 
						res.writeHead(400, {"Content-Type": contentType_text_plain});
						res.end("\n400: Bad Request "+resultRejecte+"\n");
						resultlog = LogsModule.register_log( es_servername+":"+es_port,SERVERDB,400,req.connection.remoteAddress,"Bad Request "+resultRejectd,currentdate,"");
					} ); 
				},(resultRejectd)=> { 
					res.writeHead(400, {"Content-Type": contentType_text_plain});
					res.end("\n400: Bad Request "+resultRejectd+"\n");
					resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400,req.connection.remoteAddress,"Bad Request "+resultRejectd,currentdate,"");
				} ); 
			},(resultRejectc)=> { 
				res.writeHead(400, {"Content-Type": contentType_text_plain});
				res.end("\n400: Bad Request "+resultRejectc+"\n");
				resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400,req.connection.remoteAddress,"Bad Request "+resultRejectc,currentdate,"");
			} ); 
		},(resultRejectb)=> { 
			res.writeHead(400, {"Content-Type": contentType_text_plain});
			res.end("\n400: Bad Request "+resultRejectb+"\n");
			resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400,req.connection.remoteAddress,"Bad Request "+resultRejectb,currentdate,"");
		} );
	},(resultReject)=> { 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("\n400: Bad Request "+resultReject+"\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400,req.connection.remoteAddress,"Bad Request "+resultReject,currentdate,"");
	} );
});
 
//**********************************************************
app.get('/_flush', function(req, res) { 
	var verify_flush = CommonModule.my_flush(req.connection.remoteAddress ,es_servername+':'+es_port, SERVERDB );
	verify_flush.then((resolve_result) => {
		res.writeHead(resolve_result.code, {"Content-Type": contentType_text_plain});
		res.end(resolve_result.text+"\n", 'utf-8');
	},(reject_result)=> {
		res.writeHead(reject_result.code, {"Content-Type": contentType_text_plain}); 
		res.end(reject_result.text+"\n", 'utf-8'); 
	});
});
//****************************************************************************** 
app.get('/query_metadata',middleware.ensureAuthenticated, function(req, res) { 
	"use strict";   
	var pretty = find_param(req.body.pretty, req.query.pretty);
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l"); 
	//***************************************
	var filepath =find_param(req.body.Path,req.query.Path);
	if (filepath != undefined)
		filepath=remove_quotation_marks(filepath); 
	//***************************************
	var filename =find_param(req.body.filename,req.query.filename);
	if (filename != undefined)
		filename=remove_quotation_marks(filename); 
	//***************************************
	var project =find_param(req.body.project,req.query.project);
	if (project != undefined) 
		project=remove_quotation_marks(project); 
	//***************************************
	var source =find_param(req.body.source,req.query.source);
	if (source != undefined) 
		source=remove_quotation_marks(source); 
	var bodyquery= TasksModule.compose_query(project,source,filepath, filename); 
	//1.1- find id of the existing doc for such path filename


	//console.log("Qquery is "+JSON.stringify(bodyquery));
		
	var searching = TasksModule.query_metadata(es_servername+":"+es_port,SERVERDB,bodyquery, pretty);
	var resultlog="";
	searching.then((resultFind) => { 
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(resultFind+"\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB,200,req.connection.remoteAddress,"QUERY METADATA granted to query:"
			+JSON.stringify(bodyquery),currentdate,res.user);
	},(resultReject)=> { 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("querymetadata: Bad Request "+resultReject +"\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB,400,req.connection.remoteAddress,"QUERY METADATA BAD Request on query:" 
			+JSON.stringify(bodyquery),currentdate,res.user); 
	}); 
});
//**********************************************************
app.get('/es_query_metadata', middleware.ensureAuthenticated, function(req, res) { 
	"use strict"; 
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l"); 		
	var QueryBody 	= find_param(req.body.QueryBody, req.query.QueryBody); 
	var pretty 		= find_param(req.body.pretty, req.query.pretty); 
	var mybody_obj	= JSON.parse( QueryBody);   
	//1.1- find id of the existing doc for such path filename JSON.stringify(
	var searching = TasksModule.query_metadata(es_servername+":"+es_port,SERVERDB, mybody_obj, pretty); //.replace(/\//g, '\\/');
	var resultlog="";
	searching.then((resultFind) => { 
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(resultFind+"\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB,200,req.connection.remoteAddress,"ES-QUERY METADATA granted to query:" 
			+JSON.stringify(QueryBody),currentdate,res.user);
	},(resultReject)=> { 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("es_query: Bad Request "+resultReject +"\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB,400,req.connection.remoteAddress,"ES-QUERY METADATA BAD Request on query:" 
			+JSON.stringify(QueryBody),currentdate,res.user); 
	}); 
}); 
//********************************************************** 
app.post('/register_task',middleware.ensureAuthenticated, function(req, res) {
	"use strict"; 
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l");  
	var message_bad_request = "UPLOAD Bad Request missing ";
	var resultlog ; 
	if (!req.files){
		res.writeHead(400, { 'Content-Type': contentType_text_plain });
		res.end('No files were uploaded.'); 
		resultlog = LogsModule.register_log(es_servername + ":" + es_port,SERVERDB, 400,req.connection.remoteAddress,'No files were uploaded.',currentdate,res.user);
		return;
	}  
	if (req.files.UploadJSON == undefined){
		res.writeHead(400, { 'Content-Type': contentType_text_plain });
		res.end('Error Json file not found.'); 
		resultlog = LogsModule.register_log(es_servername + ":" + es_port,SERVERDB, 400,req.connection.remoteAddress,'Error Json file not found.',currentdate,res.user);
		return;
	}
	//1 Parse the JSON and find the Project.
	//2 If not existing in the db, then we will just register the JSON content
	//3 if already exists, we need to merge with the existing entries, updating those fields redefined in the json
	var jsontext =req.files.UploadJSON.data.toString('utf8'); 
	
	var projectname= get_value_json(jsontext,"project"); //(1) parsing the JSON
	projectname=projectname.value;  
	
	console.log("send_message_to_suscribers("+projectname+")");
	send_message_to_suscribers(projectname);
	
	var result_count = TasksModule.query_count_project(es_servername + ":" + es_port,SERVERDB, projectname);
	result_count.then((resultResolve) => {
		if(resultResolve==0){//new entry (2) we resister new entry 
			var result = TasksModule.register_json(es_servername + ":" + es_port,SERVERDB,  jsontext); 
			result.then((resultResolve) => {
				resultlog = LogsModule.register_log(es_servername + ":" + es_port,SERVERDB, 200,req.connection.remoteAddress,"Add task Succeed",currentdate,res.user);  
				res.writeHead(resultResolve.code, {"Content-Type": contentType_text_plain});
				res.end(resultResolve.text + "\n", 'utf-8');
			},(resultReject)=> {
				res.writeHead(resultReject.code, {"Content-Type": contentType_text_plain});
				res.end(resultReject.text + "\n", 'utf-8');
				resultlog = LogsModule.register_log( es_servername + ":" + es_port,SERVERDB,400,req.connection.remoteAddress,"Upload Error",currentdate,res.user); 
			});
			return;
		}else{ //already existing, (3.1) first we get the registered json 
			var result_id = TasksModule.find_project_id(es_servername + ":" + es_port,SERVERDB, projectname); 
			result_id.then((result_idResolve) => { 
				var elasticsearch = require('elasticsearch');
				var clientb = new elasticsearch.Client({
					host: es_servername + ":" + es_port,
					log: 'error'
				});
				var algo= new Promise( (resolve,reject) => {
					var mergejson = JSON.parse(jsontext);
					clientb.update({//index replaces the json in the DB with the new one
						index: SERVERDB,
						type: 'tasks', 
						id: result_idResolve,
						body: {doc: mergejson}
					}, function(error, response) {
						if(error){
							reject (error );
						} else if(!error){
							var verify_flush = CommonModule.my_flush( req.connection.remoteAddress ,es_servername + ":" + es_port,SERVERDB);
							verify_flush.then((resolve_result) => { 
								resolve ("Succeed" ); 
							},(reject_result)=> { 
								reject ( );  
							});							
							
						}	 
					});//end query client.index
				});
				algo.then((resultResolve) => {
					res.writeHead(420, {"Content-Type": contentType_text_plain});
					res.end( "Succeed." , 'utf-8');					
					return;
				},(resultReject)=> {
					res.writeHead(400, {"Content-Type": contentType_text_plain});
					res.end( "error: "+resultReject, 'utf-8');			
					return;
				});
			},(result_idReject)=> {
				res.writeHead(400, {"Content-Type": contentType_text_plain});
				res.end( "error requesting id", 'utf-8');			
				return;				
			}); 
		}
	},(resultReject)=> { 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end(resultReject + "\n", 'utf-8'); //error counting projects in the DB
		resultlog = LogsModule.register_log( es_servername + ":" + es_port,SERVERDB,400,req.connection.remoteAddress,"ERROR on Update-register project tasks",currentdate,res.user); 
		return;
	});  
});

//**********************************************************
app.get('/query_task',middleware.ensureAuthenticated, function(req, res) { 
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l"); 
	//******************************************* 
	var projectname= find_param(req.body.project, req.query.project);
	projectname= validate_parameter(projectname,"project",currentdate,res.user, req.connection.remoteAddress);//generates the error log if not defined
	if (projectname.length == 0){ 
		res.writeHead(400, { 'Content-Type': contentType_text_plain });
		res.end("\n400: Bad Request, missing " + "project" + ".\n");
		return;}
	//*******************************************  
	var result_count = TasksModule.query_count_project(es_servername + ":" + es_port,SERVERDB, projectname);
	result_count.then((resultResolve) => { 
		if(resultResolve==0){//new entry (2) we resister new entry 			 
			res.writeHead(200, {"Content-Type": contentType_text_plain});
			res.end("Not entries found for the project: " + projectname+ "\n", 'utf-8'); 
			return;
		}else{ 
			var result_id = TasksModule.find_project(es_servername + ":" + es_port,SERVERDB, projectname); 
			result_id.then((result_idResolve) => {
				res.writeHead(200, {"Content-Type": contentType_text_plain});
				res.end( JSON.stringify(result_idResolve), 'utf-8');			
				return;	
			},(result_idReject)=> {
				res.writeHead(400, {"Content-Type": contentType_text_plain});
				res.end( "error requesting project", 'utf-8');			
				return;				
			}); 
		}
	},(resultReject)=> { 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end(resultReject + "\n", 'utf-8'); //error counting projects in the DB
		resultlog = LogsModule.register_log( es_servername + ":" + es_port,SERVERDB,400,req.connection.remoteAddress,"ERROR on Update-register project tasks",currentdate,res.user); 
		return;
	});  	
});
//**********************************************************
//example:
// curl -H "Content-Type: text/plain" -XPOST http://localhost:8000/signup?name="bob"\&email="bob@abc.commm"\&pw="1234"
// app.post('/signup',ipfilter(ips, {mode: 'allow'}), function(req, res) {
app.post('/signup', function(req, res) {
	"use strict";
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l"); 
	var name= find_param(req.body.userid, req.query.userid);
	var email= find_param(req.body.email, req.query.email);
	var pw=find_param(req.body.pw, req.query.pw); 
	var resultlog ;
	if (pw == undefined){ 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("\n400: SIGNUP Bad Request, missing Passwd.\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400,req.connection.remoteAddress,"SIGNUP Bad Request, missing Passwd",currentdate,""); 
		return ;
	} 
	if (email == undefined){
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("\n400: Bad Request, missing Email.\n");
		resultlog = LogsModule.register_log( es_servername+":"+es_port,SERVERDB,400,req.connection.remoteAddress,"SIGNUP Bad Request, missing Email",currentdate,""); 
		return ;
	} 	     
	console.log("[LOG]: REGISTER USER+PW"); 
	console.log("   " +colours.FgYellow + colours.Bright + " user: " + colours.Reset + email );
	console.log("   " +colours.FgYellow + colours.Bright + " request from IP: " + req.connection.remoteAddress + colours.Reset);
	if(( req.connection.remoteAddress!= ips[0] ) &&( req.connection.remoteAddress!=ips[1])&&( req.connection.remoteAddress!=ips[2])){
		console.log(" ACCESS DENIED from IP address: "+req.connection.remoteAddress);
		var messagea = "REGISTER USER '"+ email + "' FORBIDDEN access from external IP";
		resultlog = LogsModule.register_log( es_servername+":"+es_port,SERVERDB,403,req.connection.remoteAddress,messagea,currentdate,"");
		res.writeHead(403, {"Content-Type": contentType_text_plain});
		res.end("\n403: FORBIDDEN access from external IP.\n");
		return ;
	}
	var result = UsersModule.register_new_user(es_servername+":"+es_port,SERVERDB,  name, email, pw);
	result.then((resultreg) => {
		var messageb = "REGISTER USER '"+ email + "' GRANTED";
		resultlog = LogsModule.register_log( es_servername+":"+es_port,SERVERDB,resultreg.code, req.connection.remoteAddress, messageb,currentdate,""); 
		var verify_flush = CommonModule.my_flush( req.connection.remoteAddress,es_servername+':'+es_port, SERVERDB);
		verify_flush.then((resolve_result) => {
			res.writeHead(resultreg.code, {"Content-Type": contentType_text_plain});
			res.end("Succeed\n");	
		},(reject_result)=> {
			res.writeHead(reject_result.code, {"Content-Type": contentType_text_plain});
			res.end(reject_result.text+"ERROR FLUSH\n", 'utf-8');
			resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, reject_result.code, req.connection.remoteAddress, reject_result.text+"ERROR FLUSH",currentdate,"");
		});//
	},(resultReject)=> { 
		res.writeHead(resultReject.code, {"Content-Type": contentType_text_plain});
		res.end(resultReject.code+"Bad Request "+resultReject.text+"\n");
		var messagec = "REGISTER USER '"+ email + "' BAD REQUEST";
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, resultReject.code, req.connection.remoteAddress, messagec,currentdate,"");
	} ); 
});

//**********************************************************
//example:
// curl -H "Content-Type: text/plain" -XPOST http://localhost:8000/signup?name="bob"\&email="bob@abc.commm"\&pw="1234"
// app.post('/signup',ipfilter(ips, {mode: 'allow'}), function(req, res) {
app.post('/update_user', function(req, res) {
	"use strict";
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l"); 
	var name= find_param(req.body.userid, req.query.userid);
	var email= find_param(req.body.email, req.query.email);
	var pw=find_param(req.body.pw, req.query.pw); 
	if (pw == undefined){ 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("\n400: SIGNUP Bad Request, missing Email.\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400,req.connection.remoteAddress,"SIGNUP Bad Request, missing Email",currentdate,""); 
		return ;
	} 
	if (email == undefined){
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("\n400: Bad Request, missing Email.\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400,req.connection.remoteAddress,"SIGNUP Bad Request, missing Email",currentdate,""); 
		return ;
	}  
	if(( req.connection.remoteAddress!= ips[0] ) &&( req.connection.remoteAddress!=ips[1])&&( req.connection.remoteAddress!=ips[2])){ 
		var messagea = "REGISTER USER '"+ email + "' FORBIDDEN access from external IP";
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 403,req.connection.remoteAddress,messagea,currentdate,"");
		res.writeHead(403, {"Content-Type": contentType_text_plain});
		res.end("\n403: FORBIDDEN access from external IP.\n");
		return ;
	}	 
	var result = UsersModule.update_user(es_servername+":"+es_port,SERVERDB,  name, email, pw);
	result.then((resultreg) => { 
		var messageb = "UPDATE USER '"+ email + "' GRANTED";
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, resultreg.code, req.connection.remoteAddress, messageb,currentdate,""); 
		var verify_flush = CommonModule.my_flush( req.connection.remoteAddress,es_servername+':'+es_port, SERVERDB);
		verify_flush.then((resolve_result) => {
			res.writeHead(resultreg.code, {"Content-Type": contentType_text_plain});
			res.end( "Succceed\n");
		},(reject_result)=> {
			res.writeHead(reject_result.code, {"Content-Type": contentType_text_plain});
			res.end(reject_result.text+"\n", 'utf-8');
		});//
	},(resultReject)=> { 
		res.writeHead(resultReject.code, {"Content-Type": contentType_text_plain});
		res.end("updateuser: Bad Request "+resultReject.text+"\n");
		var messagec = "UPDATE USER '"+ email + "' BAD REQUEST";
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, resultreg.code, req.connection.remoteAddress, messagec,currentdate,"");
	} ); 
});

//**********************************************************
//example:
// curl -H "Content-Type: text/plain" -XGET http://localhost:8000/login?email="bob"\&pw="1234" --output token.txt
app.get('/login', function(req, res) {
	"use strict";
	var resultlog ;
	var currentdate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss.l"); 
	var email= find_param(req.body.email, req.query.email);
	var pw=find_param(req.body.pw, req.query.pw); 	
	if (pw == undefined){
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("400: Bad Request, missing Passwd\n"); 
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400, req.connection.remoteAddress, "400: Bad Request, missing Passwd",currentdate,"");
		return;
	}
	if (email == undefined){
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("400: Bad Request, missing Email\n"); 
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400, req.connection.remoteAddress, "400: Bad Request, missing Email",currentdate,"");		
		return;
	}  
	var result = UsersModule.query_count_user_pw( es_servername+":"+es_port,SERVERDB,  email, pw); //returns the count of email-pw, if !=1 then we consider not registered.
	result.then((resultCount) => {
		if(resultCount==1){
			var mytoken= auth.emailLogin(email); 
			res.writeHead(200, {"Content-Type": contentType_text_plain});
			res.end(mytoken);
			resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 200, req.connection.remoteAddress, "New token Generated",currentdate,"");
		}else{
			res.writeHead(401, {"Content-Type": contentType_text_plain});
			res.end("401 (Unauthorized) Autentication failed, incorrect user "+ email +" or passwd "+ pw +"\n"); 
			resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 401, req.connection.remoteAddress, 
				"401: Bad Request of Token, incorrect user or passwd "+email+"or passwd "+pw,currentdate,"");
		}
	},(resultReject)=> { 
		res.writeHead(400, {"Content-Type": contentType_text_plain});
		res.end("\n400: Bad Request "+resultReject+"\n");
		resultlog = LogsModule.register_log(es_servername+":"+es_port,SERVERDB, 400, req.connection.remoteAddress, 
				"400: Bad Token Request "+resultReject,currentdate,"");	
	} );
}); // login
	function originIsAllowed(origin) {
		// put logic here to detect whether the specified origin is allowed.
		return true;
	}

//report on the screen the list of fields, and values
function consolelogjsonws(JSONstring ){
	var jsonobj = JSON.parse(JSONstring);
	var keys = Object.keys(jsonobj); 
	var myres = { user: "", project:  "" };
	for (var i = 0; i < keys.length; i++) {
		var labeltxt=Object.getOwnPropertyNames(jsonobj)[i];
		if(labeltxt.toLowerCase() == 'user') {
				myres.user = jsonobj[keys[i]]; 
		}else if(labeltxt.toLowerCase() == 'project') {
				myres.project = jsonobj[keys[i]]; 
		}
	}
	return myres;
}

function send_message_to_suscribers(projectname){
	//*******************************************************************
	if (projectname != undefined){ 
		//Now we find the suscribed users and we send copy
		for (var u = 0; u < max_users; u++) {
			var found_sucrip=false;
			var i=0; 
			while(i< totalsuscriptions[u] && found_sucrip==false){
				if(ProjectSubscriptions[u,i]==projectname){
					found_sucrip=true;
				}else{
					i++;
				}
			}
			if(found_sucrip==true){ 
				//we send the copy because we found the SUSCRIPTION
				console.log("Forwarding to suscribed user: "+user_ids[u] + " Project: "+ projectname);
				user_conn[u].send("{\"Forwarding to suscribed: project modified \":\""+projectname+"\"  }"); 
			}
		}   
	}  
}		
		
app.ws('/', function(ws_connection, req) {   
	if (!originIsAllowed(ws_connection._socket.remoteAddress)) {
		// Make sure we only accept requests from an allowed origin
		req.reject();
		console.log((new Date()) + ' Connection rejected from origin '+ ws_connection._socket.remoteAddress);
		return;
	}  
	console.log((new Date()) + ' Connection accepted from ' + ws_connection._socket.remoteAddress); 
	// we need to know client index to remove them on 'close' event
	var index = clients.push(ws_connection) - 1;  
	var user_id = false;   
	// user sent some message
	ws_connection.on('message', function(message) { //received message is message  
		var user_input = consolelogjsonws( message  );  
		if(user_input.user.length==0){
			console.log("error, not provided name");
			return;
		}
		if(totalusers<max_users+1){
			user_ip[totalusers]=ws_connection._socket.remoteAddress;
			user_index[totalusers]=index;
			user_ids[totalusers]=user_input.user;
			user_conn[totalusers]=ws_connection;
			user_id=totalusers;
			totalusers=totalusers+1;
		}  
// 		console.log("registered from Ip:" + ws_connection._socket.remoteAddress + " pos "+totalusers);
		ws_connection.send(JSON.stringify({ user: user_input.user , suscribed_to_project : user_input.project  })); 
// 		console.log((new Date()) + ' Received Suscription from ' + user_input.user + ': ' + message );   
		//****************************************************** 
		//first we need find if the user_id already suscribed in ProjectSubscriptions
		var found_susc=false;
		if ( user_id<max_users){ 
			for (var i = 0; i < totalsuscriptions[user_id]; i++)  
				if(ProjectSubscriptions[user_id,i]==user_input.project) {
					found_susc=true; 
// 					console.log("found previous suscription adding at "+user_id+" "+i);
				}
			if(found_susc==false){
// 				console.log("not found previous suscription adding at "+user_id+" "+totalsuscriptions[user_id]);
				ProjectSubscriptions[user_id,totalsuscriptions[user_id]]=user_input.project;
				totalsuscriptions[user_id]=totalsuscriptions[user_id]+1;
			}
		}  
	});
	// user disconnected
	ws_connection.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Peer ' + ws_connection._socket.remoteAddress + ' disconnected.');
		var i=0;
		while (i<totalusers && user_ip[i] != ws_connection._socket.remoteAddress){
			i=i+1;
		}
		if (i<totalusers ) {
			console.log((new Date()) + " Peer " + ws_connection._socket.remoteAddress + " disconnected.");
			// remove user from the list of connected clients
			clients.splice(user_index[i], 1); 
		}
	});   
});
//**********************************************************
var tryToOpenServer = function(port)
{
	console.log('trying to Open port: ' + port);
	console.log('we will get an error IF there is other server running on the same port');
	app.listen(port, function() {
		console.log('HTTP listening:' + port);
	}).on('error', function(err){
		if (err.code === 'EADDRINUSE') {
			// port is currently in use
			console.log(colours.FgRed + colours.Bright + 'server error, port ' + port + ' is busy' + colours.Reset);
		} else { 
			console.log(err);
		}
	});
};

tryToOpenServer(SERVERPORT);
