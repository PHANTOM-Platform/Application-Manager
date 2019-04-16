var imported = document.createElement("script");
imported.src = "phantom.js";
document.getElementsByTagName("head")[0].appendChild(imported);

/**
* Returns the host and port (if defined) for building the url
* @returns {String} beginning of the url
*/
function build_appman_path(){
	var url="";
	if(typeof appserver!== 'undefined'){ // Any scope
		if(appserver){
		if(appserver.length>0){
			url=url+"http://"+appserver;
			if(typeof appport!== 'undefined') {// Any scope
				if ((appport) && appport.lenght>0){
					url=url+":"+appport;
	}	}	}	}}
	return url;
}

function app_logout() {
	sessionStorage.setItem('token', '');
	request_share_session_storage();
// 	checktoken();//already called at the end of request_share_session_storage
	window.location = 'appmanager.html';
	return false;
}

function app_load_menu_login(){
	var menu_login = document.getElementById("menu_login");
	if(menu_login){
	var menuhtml="<H1 id=\"title_login\" style=\"overflow-wrap:break-word; max-width:80%; word-break:break-all;\"><b>LOGIN into APP-MANAGER</b></H1>";
	menuhtml+="<form";
	menuhtml+="	id='requestToken'";
	menuhtml+="	method='get'";
	menuhtml+="	name=\"myForm\" autocomplete=\"on\">";
// <!-- 		encType="multipart/form-data"> //for post not for get-->
	menuhtml+="	<div class=\"center\">";
	menuhtml+="		User: <input type=\"text\" name=\"user\" id=\"user\" value=\"\"><br>";
	menuhtml+="		Password: <input type=\"password\" name=\"password\" id=\"password\" value=\"\" autocomplete=\"off\"> <br>";
	menuhtml+="		<input type=\"hidden\" name=\"pretty\" value=\"true\" />";
	menuhtml+="		<input type=\"submit\" onclick=\" applogin(document.getElementById('user').value, document.getElementById('password').value); return false;\" value=\"LOGIN\" />";
	menuhtml+="	</div>";
	menuhtml+="</form>";
	menu_login.innerHTML = menuhtml;
	return true;
	}else{
		return false;
	}
}
	

function app_load_header(){
	var menu_phantom = document.getElementById("menu_phantom");
	if(menu_phantom){
	var menuhtml="<ul class=\"menuphantom\">";
	menuhtml+="	<li class=\"menuphantom\"><a href=\"app_list.html\">List of registered APPs</a></li>";
	menuhtml+="	<li class=\"menuphantom\"><a href=\"app_new.html\">Register new APP</a></li>";
	menuhtml+="	<li class=\"menuphantom\"><a href=\"app_update.html\">Update an APP</a></li>";
	menuhtml+="	<li class=\"menuphantom\"><a href=\"app_update1.json\">Download JSON example 1</a></li>";
	menuhtml+="	<li class=\"menuphantom\"><a href=\"app_update2.json\">Download JSON example 2</a></li>";
	menuhtml+="	<li class=\"menuphantom\"><a href=\"app_update3.json\">Download JSON example 3</a></li>";
	menuhtml+="	<li class=\"menuphantom\"><a href=\"log_list.html\">List of logs</a></li>";
	menuhtml+="	<li class=\"menuphantom\"><input type=\"button\" value=\"Night mode\" onclick=\"switchnightmode()\"></a></li>";
// <!--<li class="menuphantom"><a href="query_metadata.html">Query metadata</a></li> -->
	menuhtml+="	<li class=\"phantomlogo\" style=\"float:right\">";
	menuhtml+="	<img src=\"phantom.gif\" alt=\"PHANTOM\" height=\"32\" style=\"background-color:white;\">";
	menuhtml+="	</li>";
	menuhtml+="	<li class=\"menuphantomR\">";
	menuhtml+="		<p><a onClick=\"app_logout();return false;\" href=\"PleaseEnableJavascript.html\">LogOut</a></p></li>";
	menuhtml+="</ul>";
	menu_phantom.innerHTML = menuhtml;
	}
}

	
function app_load_header_footer(){
	app_load_header();
	app_load_menu_login();
	load_footer();
	checktoken();
}


function applogin(user,password){
	var demoreplaceb = document.getElementById("demoreplaceb");
	var debug_phantom = document.getElementById("debug_phantom");
	var url = build_appman_path() + "/login?email="+user+"\&pw="+password+"";//?pretty='true'";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.status == 200) {
			var serverResponse = xhr.responseText;
			savetoken(serverResponse);
			checktoken();
		}else{
			var serverResponse = xhr.responseText;
			if(demoreplaceb) demoreplaceb.innerHTML = "<pre>Error: "+ serverResponse+ "</pre>";
			console.log("Error: "+ serverResponse);
			if(debug_phantom) debug_phantom.style.display = "block";
			app_logout();
			checktoken();
		}
	};
	xhr.send(null);
	return false;
}





//_filter_workflow_taskid_experimentid
function jsontotable_app_brief(myjson,count,first,level,lastwascoma,mtitle,filtered_fields){
	var html ="";
	var i;
// 	if(first==true){ html ="{"; }
	var mainc=mtitle;
	if(mtitle==true){
		html += "<div><table style='border:1px solid black'>\n";// style='width:100%'>";
		html += "<td><strong><center>id</center></strong></td><th><strong>&nbsp; Project &nbsp;</strong> </th>\n";
		html += "<td><strong>&nbsp; Development &nbsp;</strong></td>\n";
		html += "<td><strong>&nbsp; PT code analysis&nbsp;</strong></td>\n";
		html += "<td><strong>&nbsp; MBT early validation &nbsp;</strong></td>\n";
		html += "<td><strong>&nbsp; IP core generator&nbsp;</strong></td>\n";
		html += "<td><strong>&nbsp; MOM &nbsp;</strong></td>\n";
		count++;
	}
	var countseries=0;
	myjson.forEach(function(val) {
// 		if (count != 1 && lastwascoma==false) {
// 			if(countseries==0) {
// 				html += ",<br>";
// 			}else{
// 				html += "<br>},{<br>";
// 			}
// 		};//this is not the first element
		lastwascoma=true;
		var keys = Object.keys(val);
		keys.forEach(function(key) {
// 			if (getType(val[key]) == "string" || getType(val[key]) == "other" ){
				var tobefiltered=false;
				for (i=0;i< filtered_fields.length;i++){
					if (key.endsWith(filtered_fields[i], key.length)== true) {
						tobefiltered=true;
					}
				}
				if (tobefiltered== false) {//it is stored the length of the strings, not need to show
// 					if (count != 1 && lastwascoma==false) html += ',<br>';
// 					for (i = 0; i < level; i++) {
// 						if (count != 1) html += '&emsp;';
// 					}
					if(mtitle==true){
						if(count>1){
							html += "</tr>\n<tr>";
// 							html += "</table></div></td><br>\n";
// 							html += "<div><table style='border:1px solid black'>\n";// style='width:100%'>";
						}
						html += "<td> " + val['_id'] +" </td>\n";
						html += "<th> &nbsp;" + val['project'] +"&nbsp; </th>\n";
						//source
						if(val['source']!=undefined){
							if(val['source']['completed']!=undefined){
							if(val['source']['completed']=="true"){	
								val['source']['status']="finished";
							}}
							if(val['source']['status']==undefined){
								html += "<td bgcolor=\"#f3ff3a\">";
								val['source']['status']="waiting";
							}else if(val['source']['status']=="waiting"){ //yellow
								html += "<td bgcolor=\"#f3ff3a\">";
							}else if(val['source']['status']=="finished"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else if(val['source']['status']=="cancelled"){//red
								html += "<td bgcolor=\"#ff3e29\">";
							}else if(val['source']['status']=="started"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else{
								html += "<td>";
							}
							html += "<font color=\"black\">&nbsp;" + val['source']['status'];
						}else{
							html += "<td bgcolor=\"#f3ff3a\"><font color=\"black\">&nbsp;waiting";
						}
						html += "&nbsp;</font></td>\n";
						//pt
						if(val['pt_ca']!=undefined){
							if(val['pt_ca']['completed']!=undefined){
							if(val['pt_ca']['completed']=="true"){	
								val['pt_ca']['status']="finished";
							}}
							if(val['pt_ca']['status']==undefined){
								html += "<td bgcolor=\"#f3ff3a\">";
								val['pt_ca']['status']="waiting";
							}else if(val['pt_ca']['status']=="waiting"){ //yellow
								html += "<td bgcolor=\"#f3ff3a\">";
							}else if(val['pt_ca']['status']=="finished"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else if(val['pt_ca']['status']=="cancelled"){//red
								html += "<td bgcolor=\"#ff3e29\">";
							}else if(val['pt_ca']['status']=="started"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else{
								html += "<td>";
							}
							html += "<font color=\"black\">&nbsp;" + val['pt_ca']['status'];
						}else{
							html += "<td bgcolor=\"#f3ff3a\"><font color=\"black\">&nbsp;waiting";
						}
						html += "&nbsp;</font></td>\n";
						//mbt_early_validation
						if(val['mbt_early_validation']!=undefined){
							if(val['mbt_early_validation']['completed']!=undefined){
							if(val['mbt_early_validation']['completed']=="true"){	
								val['mbt_early_validation']['status']="finished";
							}}
							if(val['mbt_early_validation']['status']==undefined){
								html += "<td bgcolor=\"#f3ff3a\">";
								val['mbt_early_validation']['status']="waiting";
							}else if(val['mbt_early_validation']['status']=="waiting"){ //yellow
								html += "<td bgcolor=\"#f3ff3a\">";
							}else if(val['mbt_early_validation']['status']=="finished"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else if(val['mbt_early_validation']['status']=="cancelled"){//red
								html += "<td bgcolor=\"#ff3e29\">";
							}else if(val['mbt_early_validation']['status']=="started"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else{
								html += "<td>";
							}
							html += "<font color=\"black\">&nbsp;"+val['mbt_early_validation']['status'];
						}else{
							html += "<td bgcolor=\"#f3ff3a\"><font color=\"black\">&nbsp;waiting";
						}
						html += "&nbsp;</font></td>\n";
						//ip_core_generator
						if(val['ip_core_generator']!=undefined){
							if(val['ip_core_generator']['completed']!=undefined){
							if(val['ip_core_generator']['completed']=="true"){	
								val['ip_core_generator']['status']="finished";
							}}
							if(val['ip_core_generator']['status']==undefined){
								html += "<td bgcolor=\"#f3ff3a\">";
								val['ip_core_generator']['status']="waiting";
							}else if(val['ip_core_generator']['status']=="waiting"){ //yellow
								html += "<td bgcolor=\"#f3ff3a\">";
							}else if(val['ip_core_generator']['status']=="finished"){//green
								html += "<td bgcolor=\"#00FF00\">" ;
							}else if(val['ip_core_generator']['status']=="cancelled"){//red
								html += "<td bgcolor=\"#ff3e29\">" ;
							}else if(val['ip_core_generator']['status']=="started"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else{
								html += "<td>";
							}
							html += "<font color=\"black\">" +val['ip_core_generator']['status'];
						}else{
							html += "<td bgcolor=\"#f3ff3a\"><font color=\"black\">&nbsp;waiting";
						}
						html += "&nbsp;</font></td>\n";
						//mom
						if(val['mom'] !=undefined){
							if(val['mom']['completed']!=undefined){
							if(val['mom']['completed']=="true"){	
								val['mom']['status']="finished";
							}}
							if(val['mom']['status']==undefined){
								html += "<td bgcolor=\"#f3ff3a\">";
								val['mom']['status']="waiting";
							}else if(val['mom']['status']=="waiting"){ //yellow
								html += "<td bgcolor=\"#f3ff3a\">";
							}else if(val['mom']['status']=="finished"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else if(val['mom']['status']=="cancelled"){//red
								html += "<td bgcolor=\"#ff3e29\">";
							}else if(val['mom']['status']=="started"){//green
								html += "<td bgcolor=\"#00FF00\">";
							}else{
								html += "<td>";
							}
							html += "<font color=\"black\">&nbsp;" + val['mom']['status'];
						}else{
							html += "<td bgcolor=\"#f3ff3a\"><font color=\"black\">&nbsp;waiting";
						}
						html += "&nbsp;</font></td>\n";
						mtitle=false;
						count++;
						lastwascoma=false;
					}
// 					if((key=="rejection_reason")){
// 						if(val['req_status']=="rejected"){
// 							html += "<td><strong>\"" + key +"\"</strong>: \"" + val[key] +"\"</td>\n";
// 							count++;
// 							lastwascoma=false;
// 						}
// 					}else if((key!="req_status")&&(key!="energy")&&(key!="execution_id")&&(key!="app")&&(key!="device")){
// 						html += "<td><strong>\"" + key +"\"</strong>: \"" + val[key] +"\"</td>\n";
// 						count++;
// 						lastwascoma=false;

				}
// 			}else if (getType(val[key]) == "array" || getType(val[key]) == "object" ) {
// 				if(key!= "component_stats"){
// // 					if (count != 1) html += ',<br>';
// // 					for (i = 0; i < level; i++) {
// // 						if (count != 1) html += '&emsp;';
// // 					}
// 					if(mtitle==true){
// 						if(count>1){
// 							html += "</table></div></td><br>\n";
// 							html += "<div><table style='border:1px solid black'>\n";// style='width:100%'>";
// 						}
// 						html += "<tr><th><strong>\"" + key + "\"</strong>: </th>\n";
// 						
// 						mtitle=false;
// 					}else{
// 						html += "<tr><td><strong>\"" + key + "\"</strong>: </td>\n";
// 					}
// 					count++;
// 					lastwascoma=false;
// 					html += "<td><div><table style='width:100%; border:0px solid black'>\n";// style='width:100%'>";
// 					html += jsontotable( ([ val[key] ]), count, true, level+1 ,lastwascoma,mtitle,filtered_fields);
// 					html += "</table></div></td>\n";
// 				}
// // 			}else if (getType(val[key]) == "object" ) {
// // 				html += jsontotable( ([ val[key] ]), count, false, level+1,lastwascoma,mtitle,filtered_fields);
// 			};
		});
		mtitle=true;
		countseries++;
	});
// 	if(first==true){ html += "<br>}"; }
	if(mainc==true)
		html += "</table></div>\n";
	return html;
}//jsontotable_app_brief




// const sleep = (milliseconds) => {
// return new Promise(resolve => setTimeout(resolve, milliseconds))
// }


function upload_app_with_token( UploadJSON ) {
	var url = build_appman_path() + "/register_new_project";
	upload_with_token( UploadJSON, url);
	return false;
}

function update_app_with_token( UploadJSON ) {
	var url = build_appman_path() + "/update_project_tasks";
	upload_with_token( UploadJSON ,url);
	return false;
}

function list_apps(mytype,appname){
	var url = build_appman_path() + "/get_app_list?project=\""+appname+"\"";//?pretty='true'";
	list_results(mytype,url,["_id"],["_length"]);
	return false;
}

function list_app_logs(mytype,appname){// will list projects
	var url = build_appman_path() + "/get_log_list?pretty='true'";
	list_results(mytype,url,["host"],["_length","_index","_type","_score","sort"]);
	return false;
}
