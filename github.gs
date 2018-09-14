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
    throw new Error(response.getContentText());
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
    return true;
  } else {
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
 var gh_user = printVal('gh_user');
 var gh_repo = printVal('gh_repo'); 
 var response = getRepoContent(gh_user, gh_repo, path, 'master');

 Logger.log(response.sha); 
 return response.sha;

}



// ******************************************************************************************************
// Function to update a page in a github repo. 
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
function updatePage(path, fileContent, message, branch, sha) {

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
    return true;
  } else {  
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






/* 
Credits:
  The example code that has been used as a starting point for these scripts is by 
  Martin Hawksey https://mashe.hawksey.info who set it as "free to reuse as you like" - thank you!
  For ful details and the orginal code see his post at
  https://mashe.hawksey.info/2016/08/working-with-github-repository-files-using-google-apps-script-examples-in-getting-writing-and-committing-content/
*/


/**
 * Getting a file less than 1MB. 
 * See https://developer.github.com/v3/repos/contents/#get-contents
 */
function getSmallFileFromGithub(gh_filename, gh_directory){
  // set token service
  Github.setTokenService(function(){ return getGithubService_().getAccessToken();});
  // set the repository wrapper
  // Github.setRepo('YOUR_USERNAME', 'YOUR_REPO');
  Github.setRepo(gh_user, gh_repo);
  var branch = 'heads/master'; // you can switch to differnt branch
  
  // getting a single file object
  var git_file_obj = Github.Repository.getContents({ref: branch}, gh_filename);
  var git_file = Utilities.newBlob(Utilities.base64Decode(git_file_obj.content)).getDataAsString();
  
  var git_dir = Github.Repository.getContents({ref: branch}, gh_directory);
  // In my project I included a getContentsByUrl which uses a git url which is useful if working within the tree
  var git_file_by_url = Github.Repository.getContentsByUrl(git_dir[0].git_url);
  
  Logger.log(git_dir);
}

/**
 * For files over 1MB you get to fetch as a blob using sha reference. 
 * See https://developer.github.com/v3/git/blobs/#get-a-blob
 */
function getLargeFileFromGithub(tree_name, gh_filename){
  // set token service
  Github.setTokenService(function(){ return getGithubService_().getAccessToken();});
  // set the repository wrapper
  // Github.setRepo('YOUR_USERNAME', 'YOUR_REPO'); 
  Github.setRepo(gh_user, gh_repo); // e.g. Github.setRepo(gh_user, gh_repo);
  var branch = 'heads/master'; // you can switch to differnt branch
  
  // first we get the git hub directory tree 
  var file_dir = Github.Repository.getContents({ref: 'master'}, tree_name);
  // filtering for the filename we are looking for
  var git_file = file_dir.filter( function(el){ return el.name === gh_filename } );
  // getting the file
  var git_blob = Utilities.newBlob(Utilities.base64Decode(Github.Repository.getBlob(git_file[0].sha).content)).getDataAsString();
  
  Logger.log(git_blob);
}

/**
 * Committing (creating/updating) a single file to github. 
 * See https://developer.github.com/v3/repos/contents/#create-a-file
 * and https://developer.github.com/v3/repos/contents/#update-a-file
 */
function commitSingleJSONFileToGithub(gh_filename, json_string, branch, gh_commit_message) {
  
  Logger.log(gh_filename);
  Logger.log(json_string);
  // set token service
  Github.setTokenService(function(){ return getGithubService_().getAccessToken();});
  // set the repository wrapper
  // Github.setRepo('YOUR_USERNAME', 'YOUR_REPO'); 
  Github.setRepo(gh_user, gh_repo); 
  
  try { // if file exists need to get it's sha and update instead
    Logger.log('create');
    var resp = Github.Repository.createFile(branch, gh_filename, JSON.stringify(json_string), gh_commit_message);
    Logger.log(resp);
  } catch(e) {
    Logger.log('update');
    var git_file_obj = Github.Repository.getContents({ref: branch}, gh_filename);
    Github.Repository.updatePage(branch, gh_filename, JSON.stringify(json_string), git_file_obj.sha, gh_commit_message);
  }
}

/**
 * Adding multiple files to Github as a single commit.
 */
function commitMultipleFilesToGithub(json_string, gh_path_and_filename) {
  // set token service
  Github.setTokenService(function(){ return getGithubService_().getAccessToken();});
  // set the repository wrapper
  //Github.setRepo('YOUR_USERNAME', 'YOUR_REPO'); // e.g. Github.setRepo(gh_user, gh_repo);
  Github.setRepo(gh_user, gh_repo);
  var branch = 'heads/master'; // you can switch to differnt branch
  
  var newTree = []; // new tree to commit
  
  // Sending string content
  // building new tree, by pushing content to Github, here pushing test_json
  newTree.push({"path": gh_path_and_filename, // path includes path and filename
                "mode": "100644",
                "type": "blob",
                "sha" : Github.Repository.createBlob(JSON.stringify(json_string)).sha});
   
  
  
  
  //superpollo
  
  
  
  
  // Sending a blob - grabbing an example file to push
  var resp = UrlFetchApp.fetch("https://www.gstatic.com/images/icons/material/product/2x/apps_script_64dp.png");
  
  newTree.push({"path": 'apps_script_64dp.png', // path includes path and filename - here adding apps_script_64dp.png to repo root
                "mode": "100644",
                "type": "blob",
                "sha" : Github.Repository.createBlob(resp.getBlob().getBytes()).sha});          
                
  /* using http://patrick-mckinley.com/tech/github-api-commit.html as ref for this process */
  
  // 1. Get the SHA of the latest commit on the branch
  var initialCommitSha = Github.Repository.getRef(branch).object.sha;
  
  // 2. Get the tree information for that commit
  var initialTreeSha = Github.Repository.getCommit(initialCommitSha).tree.sha;
  
  // 3. Create a new tree for your commit
  var newTreeSha = Github.Repository.createTree(newTree, initialTreeSha).sha; 
  
  // 4. Create the commit
  var newCommitSha = Github.Repository.commit(initialCommitSha, newTreeSha, "YOUR COMMIT MESSAGE HERE").sha;                
  
  // 5. Link commit to the reference
  var commitResponse = Github.Repository.updateHead(branch, newCommitSha, false);
}

// From Eric Koleda oAuth2 setup
// See https://github.com/googlesamples/apps-script-oauth2/blob/master/samples/GitHub.gs
// LICENSE: https://github.com/googlesamples/apps-script-oauth2/blob/master/LICENSE
/**
 * Configures the service.
 */
function getGithubService_() {
    return OAuth2.createService('GitHub')
        .setAuthorizationBaseUrl("https://github.com/login/oauth/authorize")
        .setTokenUrl("https://github.com/login/oauth/access_token")
        .setClientId(PropertiesService.getScriptProperties().getProperty('git_clientId'))
        .setClientSecret(PropertiesService.getScriptProperties().getProperty('git_clientSecret'))
        .setScope(['repo'])
        .setCallbackFunction('authCallbackGit')
        .setPropertyStore(PropertiesService.getUserProperties())
}

/**
 * Handles the OAuth callback.
 */
function authCallbackGit(e) {
  var service = getGithubService_();
  var authorized = service.handleCallback(e);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}

/**
 * Logs the redict URI to register in the Google Developers Console, etc.
 */
function getGithubAuthURL() {
    var service = getGithubService_();
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log(authorizationUrl);
    return '<a href="'+authorizationUrl+'">Sign in with GitHub</a>'
}

/*

Following code ported from https://github.com/michael/github
 .... could be ported to a Github Library for Google Apps Script

Copyright (c) 2012 Michael Aufreiter, Development Seed
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.
- Neither the name "Development Seed" nor the names of its contributors may be
  used to endorse or promote products derived from this software without
  specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/
var Github = (function() {
    var BASEURL_ = 'https://api.github.com';
    var tokenService_;
    var __fullname,__user;
    var self_ = this;

    /*
     * Stores the function passed that is invoked to get a OAuth2 token;
     * @param {function} service The function used to get the OAuth2 token;
     *
     */
    function setTokenService(service) {
        tokenService_ = service;
    }

    function setRepo(service) {
        tokenService_ = service;
    }

    function testTokenService() {
        return tokenService_();
    }

    /**
     * Make a request.
     * @param {string} method - the method for the request (GET, PUT, POST, DELETE)
     * @param {string} path - the path for the request
     * @param {*} [data] - the data to send to the server. For HTTP methods that don't have a body the data
     *                   will be sent as query parameters
     * @param {boolean} [raw=false] - if the request should be sent as raw. If this is a falsy value then the
     *                              request will be made as JSON
     * @return {Response} - the Response for the http request
     */
    function _request(method, path, data, raw) {
        var url = __getURL(path);
        Logger.log('_request url: ' + url)
        
        var queryParams = {};

        var config = {
                    method: method,
                    muteHttpExceptions: true,
                    contentType: "application/json",
                    headers: {
                        Authorization: "Bearer " + tokenService_()
                    },
                    responseType: raw ? 'text' : 'json'
        }  
        Logger.log("_request basic config: " + JSON.stringify(config) );
      
        var shouldUseDataAsParams = data && (typeof data === 'object') && methodHasNoBody(method);
        if (shouldUseDataAsParams) {
            url = buildUrl_(url, data);
        } else if (data !== null){
          config.payload = JSON.stringify(data);
        }
        Logger.log("_request data config: " + JSON.stringify(config) );

        var response = UrlFetchApp.fetch(url, config);
        Logger.log('ResponseCode: ' + response.getResponseCode());
        if (response.getResponseCode() == 200 || response.getResponseCode() == 201) {
            return JSON.parse(response.getContentText());
        } else {
            throw new Error(response.getContentText());
        }
    }

    /**
     * Compute the URL to use to make a request.
     * @private
     * @param {string} path - either a URL relative to the API base or an absolute URL
     * @return {string} - the URL to use
     */
    function __getURL(path) {
        var url = path;

        if (path.indexOf('//') === -1) {
            url = BASEURL_ + path;
        }
        return url;
    }

    // ////////////////////////// //
    //  Private helper functions  //
    // ////////////////////////// //
    var METHODS_WITH_NO_BODY = ['GET', 'HEAD', 'DELETE'];

    function methodHasNoBody(method) {
        return METHODS_WITH_NO_BODY.indexOf(method) !== -1;
    }

    /**
     * Performs a Fetch and accumulation using pageToken parameter of the returned results
     * @param {string} url The endpoint for the URL with parameters
     * @param {Object.<string, string>} options Options to override default fetch options
     * @param {string} returnParamPath The path of the parameter to be accumulated
     * @returns {Array.Object.<string,string>} An array of objects
     * @private
     */
    function _requestAllPages(method, path, data) {
        var url = __getURL(path);
        var queryParams = {};

        var config = {
                    method: "GET",
                    muteHttpExceptions: true,
                    contentType: "application/json",
                    headers: {
                        Authorization: "Bearer " + tokenService_()
                    }
                }
        var shouldUseDataAsParams = data && (typeof data === 'object') && methodHasNoBody(method);
        if (shouldUseDataAsParams) {
            url = buildUrl_(url, data);
        } else if(data !== null) {
          config.payload = JSON.stringify(data);
        }
        
        var returnArray = [];
        var nextPageToken;
        do {
            if (nextPageToken) {
                url += "?pageToken=" + nextPageToken;
            }
            var results = UrlFetchApp.fetch(url, config);
            if (results.getResponseCode() != 200) {
                throw new Error(results.getContentText());
            } else {
                var resp = JSON.parse(results.getContentText())
                nextPageToken = resp.nextPageToken;
                returnArray = returnArray.concat(resp)
            }

        } while (nextPageToken)

        return returnArray;

    }


    /**
     * Builds a complete URL from a base URL and a map of URL parameters. Adapted from Eric Koleda's OAuth2 Lib.
     * @param {string} url The base URL.
     * @param {Object.<string, string>} params The URL parameters and values.
     * @returns {string} The complete URL.
     * @private
     */
    function buildUrl_(url, params) {
        var params = params || {}; //allow for NULL options
        var paramString = Object.keys(params).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
        return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
    }

    /**
     * Create a new Repository wrapper
     * @param {string} user - the user who owns the respository
     * @param {string} repo - the name of the repository
     * @return {Repository}
     */
    function setRepo(user, repo) {
        __fullname = getFullName_(user, repo);
    }

    /**
     * Computes the full repository name
     * @param {string} user - the username (or the full name)
     * @param {string} repo - the repository name, must not be passed if `user` is the full name
     * @return {string} the repository's full name
     */
    function getFullName_(user, repo) {
        var fullname = user;

        if (repo) {
            fullname = user + '/' + repo;
        }

        return fullname;
    }
    
    /**
    * Create a new User wrapper
    * @param {string} user - the user who in authenticated
    */
    function setUser(user) {
      __user = user;
    }
    
    /**
    * Sets the default options for API requests
    * @protected
    * @param {Object} [requestOptions={}] - the current options for the request
    * @return {Object} - the options to pass to the request
    */
   function _getOptionsWithDefaults(requestOptions) {
     requestOptions = requestOptions ? requestOptions : {};
      if (!(requestOptions.visibility || requestOptions.affiliation)) {
         requestOptions.type = requestOptions.type || 'all';
      }
      requestOptions.sort = requestOptions.sort || 'updated';
      requestOptions.per_page = requestOptions.per_page || '100'; // eslint-disable-line

      return requestOptions;
   }
    
    
    /**
     * User Objects
     */
    self_.User = function() {};
    

    
    /**
    * Get the url for the request. (dependent on if we're requesting for the authenticated user or not)
    * @private
    * @param {string} endpoint - the endpoint being requested
    * @return {string} - the resolved endpoint
    */
   function __getScopedUrl(endpoint) {
      if (__user) {
         return endpoint ?
            Utilities.formatString('/users/%s/%s', __user, endpoint) :
            Utilities.formatString('/users/%s',__user);

      } else { // eslint-disable-line
         switch (endpoint) {
            case '':
               return '/user';

            case 'notifications':
            case 'gists':
               return '/'+endpoint;

            default:
               return '/user/'+endpoint;
         }
      }
     }
     
     /**
     * List the user's repositories
     * @see https://developer.github.com/v3/repos/#list-user-repositories
     * @param {Object} [options={}] - any options to refine the search
     * @return {Promise} - the promise for the http request
     */
     self_.User.listRepos = function (options) {
       if (typeof options === 'function') {
         options = {};
       }
       
       options = _getOptionsWithDefaults(options);
       
       return _requestAllPages('GET', __getScopedUrl('repos'), options);
     }
     
     /**
      * Show the user's profile
      * @see https://developer.github.com/v3/users/#get-a-single-user
      * @return {Promise} - the promise for the http request
      */
     self_.User.getProfile = function () {
        return _request('GET', __getScopedUrl(''), null);
     }
     
    /**
     * Repository Objects
     */
    self_.Repository = function() {};

    /**
     * Get a reference
     * @see https://developer.github.com/v3/git/refs/#get-a-reference
     * @param {string} ref - the reference to get
     * @return {Promise} - the promise for the http request
     */
    self_.Repository.getRef = function(ref) {
      return _request('GET', Utilities.formatString('/repos/%s/git/refs/%s', __fullname, ref));
    };
    
   /**
    * Get a commit from the repository
    * @see https://developer.github.com/v3/repos/commits/#get-a-single-commit
    * @param {string} sha - the sha for the commit to fetch
    * @return {Promise} - the promise for the http request
    */
   self_.Repository.getCommit = function(sha) {
      return _request('GET', Utilities.formatString('/repos/%s/git/commits/%s', __fullname, sha));
   }
   
   /**
    * Create a new tree in git
    * @see https://developer.github.com/v3/git/trees/#create-a-tree
    * @param {Object} tree - the tree to create
    * @param {string} baseSHA - the root sha of the tree
    * @return {Promise} - the promise for the http request
    */
   self_.Repository.createTree = function(tree, baseSHA) {
      return _request('POST',  Utilities.formatString('/repos/%s/git/trees', __fullname) , {
        tree:tree, 
        base_tree: baseSHA
      });
   }
   
   /**
    * Add a commit to the repository
    * @see https://developer.github.com/v3/git/commits/#create-a-commit
    * @param {string} parent - the SHA of the parent commit
    * @param {string} tree - the SHA of the tree for this commit
    * @param {string} message - the commit message
    * @return {Promise} - the promise for the http request
    */
   self_.Repository.commit = function(parent, tree, message) {
      var data = {
         message: message,
         tree: tree,
         parents: [parent]
      };

      return _request('POST', Utilities.formatString('/repos/%s/git/commits', __fullname), data);
   }
   
   /**
    * Update a ref
    * @see https://developer.github.com/v3/git/refs/#update-a-reference
    * @param {string} ref - the ref to update
    * @param {string} commitSHA - the SHA to point the reference to
    * @param {boolean} force - indicates whether to force or ensure a fast-forward update
    * @param {Requestable.callback} cb - will receive the updated ref back
    * @return {Promise} - the promise for the http request
    */
   self_.Repository.updateHead = function(ref, commitSHA, force) {
      return _request('PATCH', Utilities.formatString('/repos/%s/git/refs/%s', __fullname, ref), {
         sha: commitSHA,
         force: force
      });
   }

    /**
     * Get the contents of a repository
     * @see https://developer.github.com/v3/repos/contents/#get-contents
     * @param {string} ref - the ref to check
     * @param {string} path - the path containing the content to fetch
     * @param {boolean} raw - `true` if the results should be returned raw instead of GitHub's normalized format
     * @return {Promise} - the promise for the http request
     */
    self_.Repository.getContents = function(ref, path, raw) {
      path = path ? encodeURI(path) : '';
      return _request('GET', Utilities.formatString('/repos/%s/contents/%s', __fullname, path), ref, raw);
    }

    /**
     * Get the contents of by url
     * @see https://developer.github.com/v3/repos/contents/#get-contents
     * @param {string} url - full url of file
     * @return {Promise} - the promise for the http request
     */
    self_.Repository.getContentsByUrl = function(url) {
        return Utilities.newBlob(Utilities.base64Decode(_request('GET', url).content)).getDataAsString();
    }
   
   /**
    * Get a raw blob from the repository
    * @see https://developer.github.com/v3/git/blobs/#get-a-blob
    * @param {string} sha - the sha of the blob to fetch
    * @return {Promise} - the promise for the http request
    */
   self_.Repository.getBlob = function(sha) {
      return _request('GET', Utilities.formatString('/repos/%s/git/blobs/%s', __fullname, sha));
   }
   
   /**
    * Create a blob
    * @see https://developer.github.com/v3/git/blobs/#create-a-blob
    * @param {(string|Buffer|Blob)} content - the content to add to the repository
    * @return {Promise} - the promise for the http request
    */
   self_.Repository.createBlob = function(content) {
      var postBody = _getContentObject(content);
      Logger.log('sending content', postBody);
      return _request('POST', Utilities.formatString('/repos/%s/git/blobs', __fullname), postBody);
   }
   
   /**
    * Create a file to the repository
    * @see https://developer.github.com/v3/repos/contents/#update-a-file
    * @param {string} branch - the name of the branch
    * @param {string} path - the path for the file
    * @param {string} content - the contents of the file
    * @param {string} message - the commit message
    * @param {Object} [options] - commit options
    * @param {Object} [option.sha] - the sha of a file to update
    * @param {Object} [options.name] - the author of the commit
    * @param {Object} [options.email] - the email of the committer
    * @param {boolean} [options.encode] - true if the content should be base64 encoded
    * @return {Promise} - the promise for the http request
    */
   self_.Repository.createFile = function(branch, path, content, message, options) {
      options = options || {}
      var filePath = path ? encodeURI(path) : '';
      var shouldEncode = options.encode || true;
      var commit = {
         branch: branch,
         message: message,
         content: shouldEncode ? Utilities.base64Encode(content) : content
      }; 
      
      if (options.name && options.email) {
        commit.committer = {name: options.name,
                            email: options.email};
      }
      
      if (options.sha) {
        commit.sha = options.sha;
      }
     
     Logger.log('create - commit');
     Logger.log(commit);
     var url = Utilities.formatString('/repos/%s/contents/%s', __fullname, path)
     Logger.log('create - url');
     Logger.log(url);
     return _request('PUT', url, commit);
   }
   
   /**
    * Update a file to the repository
    * @see https://developer.github.com/v3/repos/contents/#update-a-file
    * @param {string} branch - the name of the branch
    * @param {string} path - the path for the file
    * @param {string} content - the contents of the file
    * @param {string} message - the commit message
    * @param {Object} [options] - commit options
    * @param {Object} [option.sha] - the sha of a file to update
    * @param {Object} [options.name] - the author of the commit
    * @param {Object} [options.email] - the email of the committer
    * @param {boolean} [options.encode] - true if the content should be base64 encoded
    * @return {Promise} - the promise for the http request
    */
   self_.Repository.updatePage = function(branch, path, content, sha, message, options) {
      options = options || {}
      var filePath = path ? encodeURI(path) : '';
      var shouldEncode = options.encode || true;
      var commit = {
         branch: branch,
         sha: sha,
         message: message,
         content: shouldEncode ? Utilities.base64Encode(content) : content
      }; 
      
      if (options.name && options.email) {
        commit.committer = {name: options.name,
                            email: options.email};
      }
      
      return _request('PUT', Utilities.formatString('/repos/%s/contents/%s', __fullname, path), commit);
   }
   
   
   
   /**
    * Get the object that represents the provided content
    * @param {string|Buffer|Blob} content - the content to send to the server
    * @return {Object} the representation of `content` for the GitHub API
    */
   function _getContentObject(content) {
      Logger.log(typeof content);
      if (typeof content === 'string') {
         Logger.log('content is a string');
         return {
            content: content,
            encoding: 'utf-8'
         };

      } else {
        return {
              content: Utilities.base64Encode(content),
              encoding: 'base64'
           };
      }
      
      /*else if (typeof Buffer !== 'undefined' && content instanceof Buffer) {
         Logger.log('We appear to be in Node');
         return {
            content: content.toString('base64'),
            encoding: 'base64'
         };

      } else if (typeof Blob !== 'undefined' && content instanceof Blob) {
         Logger.log('We appear to be in the browser');
         return {
            content: Utilities.base64Encode(content),
            encoding: 'base64'
         };

      } else { // eslint-disable-line
         Logger.log(Utilities.formatString('Not sure what this content is: %s, %s'), content, JSON.stringify(content));
         throw new Error('Unknown content passed to postBlob. Must be string or Buffer (node) or Blob (web)');
      }*/
   }

    return {
        setTokenService: setTokenService,
        setRepo: setRepo,
        setUser: setUser,
        User: User,
        Repository: Repository,
    }

})()
