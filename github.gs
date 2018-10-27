// ******************************************************************************************************
// Function to store the github details of the user and repo, and store what is necessary for future calls
// ******************************************************************************************************
function githubRepoConfigure() {
  
  var gh_user = Browser.inputBox("Enter the GitHub username of the repo owner", "GitHub username", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("gh_user", gh_user); 
  
  var gh_repo = Browser.inputBox("Enter your GitHub repo", "GitHub repo", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("gh_repo", gh_repo);  
  
 }  


function setGithubAuthToken() {
  
  //get the user details
  var git_user = Browser.inputBox("Enter your GitHub username", "GitHub username", Browser.Buttons.OK); 
  PropertiesService.getUserProperties().setProperty("git_user", git_user); 
  var git_password = Browser.inputBox("Enter your GitHub password (it will not be stored)", "GitHub password", Browser.Buttons.OK);
  //base64 encode the username:pwd to create the Basic authentication that you need to access the OAUTH API
  var authString = Utilities.base64Encode(git_user + ':' + git_password);
  
  
  //Now make a call to GitHub and use Basic Auth to get an OAuth token 
  var url = 'https://api.github.com/authorizations';  
   
  //note is required
  var payloadParams = {
    scopes: [
      'repo',
      'gist'
    ],
    note: 'gas-github_' + Date.now()  
  }
  
  var params = {
			method: 'POST',
			muteHttpExceptions: true,
			contentType: "application/json",
            responseType: 'json',
            headers: { Authorization: 'Basic ' + authString },
			payload: JSON.stringify( payloadParams )
		}
  var response = UrlFetchApp.fetch(url, params);
  
  if (response.getResponseCode() == 200 || response.getResponseCode() == 201) {
    Logger.log(response);
    var response_JSON = JSON.parse(response);
 	var git_token = response_JSON.token;
    PropertiesService.getUserProperties().setProperty("git_token", git_token);
  } else {
    Logger.log("There was an error when trying to create the authorisation token.");
	throw new Error(response.getContentText());
  }

}



// ******************************************************************************************************
// Function to send to logger the list of the repos of a user. 
// Use OAuth to have a higher rate of requests
// IN:
//   Optional:
//     gh_user: a string with the name of the repo owner. Defaults to the scriptProperty of the same name
// OUT:
//   JSON response
// ******************************************************************************************************
function getRepos(gh_user) {

  if (typeof gh_user === 'undefined') { gh_user = printVal('gh_user'); }
  
  // https://developer.github.com/v3/repos/contents/#create-a-file
  var url = Utilities.formatString('https://api.github.com/users/%s/repos', gh_user);    
    
  var params = {
    method: 'GET',
    contentType: "application/json",
    responseType: 'json',
  }
    
  var response = UrlFetchApp.fetch(url, params);

  if (response.getResponseCode() == 200 || response.getResponseCode() == 201) {
    return JSON.parse(response.getContentText());
  } else {
    throw new Error(response.getContentText());
  }
    
}



// ******************************************************************************************************
// Function to send to logger the content of one of your repos. 
// Does not use Auth since I am using only public repos
// IN:
//   Optional:
//     gh_user: a string with the name of the repo owner. Defaults to the scriptProperty of the same name
//     gh_repo: a string with the repo name. Defaults to the scriptProperty of the same name
//     path: the path of the folder or file. Defaults to /
//     branch: a string with the branch. Defaults to 'master'
// OUT:
//   JSON response
// ******************************************************************************************************
function getRepoContent(gh_user, gh_repo, path, branch) {
  
  if (typeof gh_user === 'undefined') { gh_user = printVal('gh_user'); }
  if (typeof gh_repo === 'undefined') { gh_repo = printVal('gh_repo'); }
  if (typeof path === 'undefined'   ) { path    = ''; }
  if (typeof branch === 'undefined') { branch = 'master' }
  var token   = printVal('git_token');
  
  var params = {
    method: 'GET',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token },
    contentType: "application/json",
    responseType: 'json',
  }
   
  var url = Utilities.formatString('https://api.github.com/repos/%s/%s/contents/%s', gh_user, gh_repo, path);  
  var response = UrlFetchApp.fetch(url, params);

  if (response.getResponseCode() == 200 || response.getResponseCode() == 201) {
    return JSON.parse(response.getContentText());
  } else {
    throw new Error('path: ' + path + ' / Response: ' + response.getContentText());
    return false;
  }

}



// ******************************************************************************************************
// Function to create a file in a github repo. 
// See https://developer.github.com/v3/repos/contents/#create-a-file
// IN:
//   Required:
//     path: where the file will be (include the filename!)
//     fileContent: the content of the file (it will be converted to base64 before sending it)
//   Optional:
//     message: a github comment
//     branch: defaults to master
// OUT:
//   True (the file was created)
//   False (the file was not created)
// ******************************************************************************************************
function createFile(path, fileContent, message, branch) {
  
  Logger.log('Create file at ' + path);

  if (typeof message === 'undefined') { message = 'Created on ' + Date.now(); + ' via GSuite'}
  if (typeof branch === 'undefined') { branch = 'master' }
  var gh_user = printVal('gh_user');
  var gh_repo = printVal('gh_repo');
  var token   = printVal('git_token');
  var git_user = printVal('git_user');
  
  var filePath = path ? encodeURI(path) : '';
     		
  // https://developer.github.com/v3/repos/contents/#create-a-file
  var url = Utilities.formatString('https://api.github.com/repos/%s/%s/contents/%s', gh_user, gh_repo, filePath);  
  
  var email = Session.getActiveUser().getEmail();
  
  var payloadParams= {
    branch: branch,
    message: message,
    content: Utilities.base64Encode(fileContent),
    committer: {
      name: git_user,
      email: email
    }
  }
        
  var params = {
    method: 'PUT',
    muteHttpExceptions: true,
    contentType: "application/json",
    responseType: 'json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify( payloadParams )
  }
      
  var response = UrlFetchApp.fetch(url, params);
  
  

  if (response.getResponseCode() == 200 || response.getResponseCode() == 201) {
    Logger.log("File creation successful");
    return true;
  } else {
    Logger.log(response);
    return false;
  }
    
}


function createImageInGitHub(fileID, path){
  var fileContent = DriveApp.getFileById(fileID).getBlob().getBytes();
  createFile(path, fileContent); 
}



// ******************************************************************************************************
// Function to update a file in a github repo. 
// See https://developer.github.com/v3/repos/contents/#create-a-file
// IN:
//   Required:
//     path: where the file is (include the filename)
// OUT:
//   the sha for the file 
// ******************************************************************************************************
function getFileSha(path){
  Logger.log('Get file sha');  
  var gh_user = printVal('gh_user');
  var gh_repo = printVal('gh_repo'); 
  var response = getRepoContent(gh_user, gh_repo, path, 'master');
  Logger.log(response.sha); 
  return response.sha;
}



// ******************************************************************************************************
// Function to update a file in a github repo. 
// See https://developer.github.com/v3/repos/contents/#create-a-file
// IN:
//   Required:
//     path: where the file will be (include the filename!)
//     fileContent: the content of the file (it will be converted to base64 before sending it)
//     sha: the sha of the file to be updated  
//   Optional:
//     message: a github comment
//     branch: defaults to master
// OUT:
//   True (the file was created)
//   False (the file was not created)
// ******************************************************************************************************
function updateFile(path, fileContent, message, branch, sha) {
  
  Logger.log('Update file at ' + path);

  
  if (typeof message === 'undefined') { message = 'Created on ' + Date.now(); +' via gsuite';}
  if (typeof branch === 'undefined') { branch = 'master' }
  if (typeof sha === 'undefined') { sha = getFileSha(path) }
  var gh_user = printVal('gh_user');
  var gh_repo = printVal('gh_repo');
  var token   = printVal('git_token');
  var git_user = printVal('git_user');
  
  var filePath = path ? encodeURI(path) : '';
     		
  // https://developer.github.com/v3/repos/contents/#update-a-file
  var url = Utilities.formatString('https://api.github.com/repos/%s/%s/contents/%s', gh_user, gh_repo, filePath);  
  
  var email = Session.getActiveUser().getEmail();
  
  var payloadParams= {
    branch: branch,
    message: message,
    sha: sha,
    content: Utilities.base64Encode(fileContent),
    committer: {
      name: git_user,
      email: email
    }
  }
        
  var params = {
    method: 'PUT',
    muteHttpExceptions: true,
    contentType: "application/json",
    responseType: 'json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify( payloadParams )
  }
      
  var response = UrlFetchApp.fetch(url, params);

  if (response.getResponseCode() == 200 || response.getResponseCode() == 201) {
    Logger.log("File update successful");
    return true;
  } else {  
    Logger.log(response);
    return false;
  }
    
}




// ******************************************************************************************************
// Function to delete a file in a github repo. 
// See https://developer.github.com/v3/repos/contents/#create-a-file
// IN:
//   Required:
//     path: where the file will be (include the filename!)
//     sha: the sha of the file to be updated  
//   Optional:
//     message: a github comment
//     branch: defaults to master
// OUT:
//   True (the file was created)
//   False (the file was not created)
// ******************************************************************************************************
function deleteFile(path, message, branch, sha) {

  if (typeof message === 'undefined') { message = 'Created on ' + Date.now(); }
  if (typeof branch === 'undefined') { branch = 'master' }
  var gh_user = printVal('gh_user');
  var gh_repo = printVal('gh_repo');
  var token   = printVal('git_token');
  var git_user = printVal('git_user');
  
  var filePath = path ? encodeURI(path) : '';
     		
  // https://developer.github.com/v3/repos/contents/#delete-a-file
  var url = Utilities.formatString('https://api.github.com/repos/%s/%s/contents/%s', gh_user, gh_repo, filePath);  
  
  var email = Session.getActiveUser().getEmail();
  
  var payloadParams= {
    branch: branch,
    message: message,
    sha: sha,
    committer: {
      name: git_user,
      email: email
    }
  }
        
  var params = {
    method: 'DELETE',
    muteHttpExceptions: true,
    contentType: "application/json",
    responseType: 'json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify( payloadParams )
  }
      
  var response = UrlFetchApp.fetch(url, params);

  if (response.getResponseCode() == 200 || response.getResponseCode() == 201) {
    return true;
  } else {  
    return false;
  }
    
}
