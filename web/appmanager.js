
var appserver = "localhost";
var appport = 8500;

function checktoken() {
	var menu_phantom = document.getElementById("menu_phantom");
	var requestToken = document.getElementById("requestToken");
	var title_login = document.getElementById("title_login");
	if(!sessionStorage.token  || sessionStorage.token == undefined ) { 		
		if(menu_phantom) document.getElementById("menu_phantom").style.display = "none";
		if(requestToken) document.getElementById("requestToken").style.display = "block"; 
		if(title_login) document.getElementById("title_login").style.display = "block"; 
	}else if (sessionStorage.token.length == 0) { 
		if(menu_phantom) document.getElementById("menu_phantom").style.display = "none"; 
		if(requestToken) document.getElementById("requestToken").style.display = "block";
		if(title_login) document.getElementById("title_login").style.display = "block"; 
	}else{
		if(menu_phantom) document.getElementById("menu_phantom").style.display = "block";
		if(requestToken) document.getElementById("requestToken").style.display = "none"; 
		if(title_login) document.getElementById("title_login").style.display = "none"; 		 
	} 
// 	if(sessionStorage.token != undefined)
// 	if(title_login) document.getElementById("title_login").innerHTML = " "+JSON.stringify(sessionStorage);  
	return false;
}

function message_broadcast( ) {  //hace que pida las variables de los otros
	localStorage.setItem('getSessionStorage', 'sessionStorage.token');
	localStorage.removeItem('getSessionStorage', 'sessionStorage.token');
}

function share_session_storage_new(){ 
	// Ask other tabs for session storage (this is ONLY to trigger event)
	message_broadcast( ) ; 
	window.addEventListener('storage', function(event) {  
		if (event.key == 'sessionStorage'){ // && isEmpty(memoryStorage)) { 
			sessionStorage.setItem('token', JSON.parse(event.newValue));
			checktoken(); 
		}
	});  
	window.onbeforeunload = function() {
// 		sessionStorage.clear();
	};  
	checktoken(); 
	return false;
} 

function request_share_session_storage(){ 
	message_broadcast(); 
	localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage.token));
	return false;
} 


function share_session_storage_login(){ 
	// Ask other tabs for session storage (this is ONLY to trigger event)  
	window.addEventListener('storage', function(event) {  
		if (event.key == 'getSessionStorage') { 
			// Some tab asked for the memoryStorage -> send it  
			localStorage.clear();
			localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage.token)); 
		}
	});  
	window.onbeforeunload = function() {
// 		sessionStorage.clear();
	};  
	checktoken(); 
	return false;
} 
 
function savetoken(mytoken) {
	if(typeof(Storage) !== "undefined") {
		if (sessionStorage.token) { //update with new token 
			sessionStorage.setItem('token', mytoken);
		} else { //not defined token before
			sessionStorage.setItem('token', mytoken); 
		}
		request_share_session_storage();  
		document.getElementById("debug_phantom").style.display = "none"; 
	} else {
		document.getElementById("demoreplaceb").innerHTML = "Sorry, your browser does not support web storage...";
		document.getElementById("debug_phantom").style.display = "block"; 
	}
} 

function start_page_login() {  
	share_session_storage_login();
	checktoken(); 
	return false;
} 

function start_page_new() {  
 	share_session_storage_new();
	checktoken(); 
	return false;
} 

function logout() {  
	sessionStorage.setItem('token', ''); 
	request_share_session_storage(); 
	checktoken();
	return false;
}

var s = 'a string', a = [], o = {}, i = 5;
function getType(p) {
	if (Array.isArray(p)) return 'array';
	else if (typeof p == 'string') return 'string';
	else if (p != null && typeof p == 'object') return 'object';
	else return 'other';
} 

function myresults(user,password){   
	var url="http://"+appserver+":"+appport+"/login?email="+user+"\&pw="+password+""; //?pretty='true'"; 
	var xhr = new XMLHttpRequest();  
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() { 
		if (xhr.status == 200) { 
			var serverResponse = xhr.responseText; 
			savetoken(serverResponse);
			checktoken(); 
		}else{
			var serverResponse = xhr.responseText; 
			document.getElementById("demoreplaceb").innerHTML = "Error: "+ serverResponse;  
			document.getElementById("debug_phantom").style.display = "block"; 
			logout();
			checktoken();
		}
	};
	xhr.send(null);
	return false;
}

var s = 'a string', a = [], o = {}, i = 5;
function getType(p) {
	if (Array.isArray(p)) return 'array';
	else if (typeof p == 'string') return 'string';
	else if (p != null && typeof p == 'object') return 'object';
	else return 'other';
}

var count =1;
function jsontotableb(myjson){
	var html ="";
	myjson.forEach(function(val) {
		var keys = Object.keys(val);
		keys.forEach(function(key) {
			if ( getType(val[key]) == "string" || getType(val[key]) == "other" ) { 
				html += "<td><strong>" + key + "</strong>: " + val[key] + "</td>";
			};
		});
	});
	return html;
}

function jsontotable(myjson){
	var html ="";
	myjson.forEach(function(val) {
		var keys = Object.keys(val);
		html += "<div class = 'cat'><table>"; // style='width:100%'>";
		count =1;	 
		keys.forEach(function(key) {
			if ( getType(val[key]) == "string" || getType(val[key]) == "other" ){
			if( key != "project_length" ){
				if(count == 1) { 
					html += "<tr><th><strong>" + key + "</strong>: " + val[key] + "</th></tr>";
				} else{
					html += "<tr><td><strong>" + key + "</strong>: " + val[key] + "</td></tr>";	
				}
				count = count +1 ;
			}}else if ( getType(val[key]) == "object" ) {
				newjson = JSON.stringify(val[key]);
				html += "<tr><td><strong> &emsp; " + key + "</strong>: </td>" ;		
				html += jsontotableb( [ val[key] ] ) +"</tr>";
			};
		});
		html += "</table></div><br>";
	});
	return html;
}

function jsontohtml(myjson){
	var html ="[";
	var newquery = 1 ;
	myjson.forEach(function(val) {
		if ( newquery == 0 ) { html += ",</div><br>" }; 
		newquery = 0 ;	
		var keys = Object.keys(val);
		html += "<div class = 'cat'>{"; 
		count =1;
		keys.forEach(function(key) {
			if ( getType(val[key]) == "string" || getType(val[key]) == "other" ){
			if( key != "project_length" ){
				if (count != 1) html += ',<br>&emsp;';
				html += "<strong>\"" + key + "\"</strong>: \"" + val[key] +"\"";
				count = count +1 ;
			}}else if ( getType(val[key]) == "object" ) {
				if (count != 1) html += ',<br>&emsp;';
				newjson = JSON.stringify(val[key]);
				html += "<strong>\"" + key + "\"</strong>: \"" + JSON.stringify(val[key]) +"\"" ;
				//html += jsontotableb( [ val[key] ] ) +"</tr>";
			};
		});
		html += "<br>}";
	});
	html += "</div><br>]"; 
	return html;
} 

function upload_with_token( UploadJSON ) {
	share_session_storage();
	if(!sessionStorage.token) {
		document.getElementById("demoreplaceb").innerHTML = "Sorry, try login again, missing token...";
		document.getElementById("debug_phantom").style.display = "block"; 
		return false;
	} 
	if((sessionStorage.token !== undefined) && (sessionStorage.token.length>0)) {
		var url = "http://"+appserver+":"+appport+"/register_new_project"
		var xhr = new XMLHttpRequest();
		var formData = new FormData();
		var resultElement = document.getElementById("demoreplaceb");
		xhr.open('POST', url, true);
		xhr.setRequestHeader("Authorization", "JWT " + sessionStorage.token);
		xhr.addEventListener('load', function() {
			var responseObject = (xhr.responseText);
			console.log(responseObject);
			resultElement.innerHTML = xhr.responseText;
			document.getElementById("debug_phantom").style.display = "block"; 
		}); 
		formData.append("UploadJSON", UploadJSON.files[0]); 
//formData.append("UploadFile", UploadFile.data); 
		xhr.send(formData);
	} else {
		document.getElementById("demoreplaceb").innerHTML = "Sorry, try login again, missing token...";
		document.getElementById("debug_phantom").style.display = "block"; 
	}
	return false;
} 

function update_with_token( UploadJSON ) {
	if(!sessionStorage.token) {
		document.getElementById("demoreplaceb").innerHTML = "Sorry, try login again, missing token...";
		document.getElementById("debug_phantom").style.display = "block"; 
		return false;
	} 
	if((sessionStorage.token !== undefined) && (sessionStorage.token.length>0)) {
		var url = "http://"+appserver+":"+appport+"/update_project_tasks"
		var xhr = new XMLHttpRequest();
		var formData = new FormData();
		var resultElement = document.getElementById("demoreplaceb");
		xhr.open('POST', url, true);
		xhr.setRequestHeader("Authorization", "JWT " + sessionStorage.token);
		xhr.addEventListener('load', function() {
			var responseObject = (xhr.responseText);
			console.log(responseObject);
			resultElement.innerHTML = xhr.responseText;
			document.getElementById("debug_phantom").style.display = "block"; 
		}); 
		formData.append("UploadJSON", UploadJSON.files[0]); 
// formData.append("UploadFile", UploadFile.data);
		xhr.send(formData);
	} else {
		document.getElementById("demoreplaceb").innerHTML = "Sorry, try login again, missing token...";
		document.getElementById("debug_phantom").style.display = "block"; 
	}
	return false;
} 

function list_results(mytype,appname){
	var url="http://"+appserver+":"+appport+"/get_app_list?project=\""+appname+"\""; //?pretty='true'"; 
	var xhr = new XMLHttpRequest(); 
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
	var html = ""; // to store the conversion of json to html format 
		if (xhr.readyState === 4 && xhr.status == 200) { 
			var serverResponse = xhr.responseText;
			// document.getElementById('demoreplacea').innerHTML = serverResponse; //this will show the reponse of the server as txt; 
			var myjson = JSON.parse(serverResponse);
			if(myjson.hits!=undefined) {
			myjson = myjson.hits;
			}else{
				myjson = [ myjson ];
			}
			if(myjson!=undefined) {
				if (mytype== 1) {
					html += jsontotable(myjson);
				}else if (mytype == 2){
					html += jsontohtml(myjson);
				}else{
					html += JSON.stringify(myjson) ;
				} 
			}
			//document.getElementById('demoreplaceb').innerHTML = JSON.stringify(myjson) + "<br>" + html ;// myjson[0].project;
			document.getElementById('demoreplaceb').innerHTML = html;
			document.getElementById("debug_phantom").style.display = "block"; 
		}
	};
	xhr.send(null);
	return false;
}
