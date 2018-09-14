// ******************************************************************************************************
// Function to create menus when you open the sheet
// ******************************************************************************************************
function onOpen(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [{name: "Configure the github repo", functionName: "githubRepoConfigure"},
                     {name: "Configure the Cloudinary API", functionName: "cloudinaryConfigure"},
                     {name: "Configure Google Analytics and Optimize", functionName: "configureGoogleScripts"},
                     {name: "Configure pagesID from gDrive", functionName: "configurePagesID"},
                     {name: "Set your GitHub authentication", functionName: "setGithubAuthToken"},
                    ]; 
  ss.addMenu("Configure", menuEntries);
}


// ******************************************************************************************************
// Function to store the github details for the conections to the GitHub repo
// ******************************************************************************************************
function githubRepoConfigure() {
  
  var gh_user = Browser.inputBox("Enter the GitHub username of the repo owner", "GitHub username", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("gh_user", gh_user); 
  
  var gh_repo = Browser.inputBox("Enter your GitHub repo", "GitHub repo", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("gh_repo", gh_repo);  
  
}  


                     
// ******************************************************************************************************
// Function to store the Cloudinary details of the user for future calls
// ******************************************************************************************************
function cloudinaryConfigure() {
  
  var cloudinary_name = Browser.inputBox("Enter the Cloudinary name", "Cloudinary name", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("cloudinary_name", cloudinary_name); 
  
  var cloudinary_key = Browser.inputBox("Enter the Cloudinary API key", "Cloudinary key", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("cloudinary_key", cloudinary_key); 

  var cloudinary_secret = Browser.inputBox("Enter the Cloudinary API secret", "Cloudinary secret", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("cloudinary_secret", cloudinary_secret); 

 }  

                     
                     
// ******************************************************************************************************
// Function to store the Google Analytics Tracking ID and the Google Optimize ID 
// ******************************************************************************************************
function configureGoogleScripts() {
  
  var ga_trackingID = Browser.inputBox("Enter your Google Analytics Tracking ID", "Tracking ID", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("ga_trackingID", ga_trackingID.trim()); 
  
  var gOptimiseID = Browser.inputBox("Enter your Google Optimise ID", "Google Optimise ID", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("gOptimiseID", gOptimiseID.trim()); 
 }  


                     
// ******************************************************************************************************
// Function to store the PagesID for those pages generated from a gDoc 
// ******************************************************************************************************
function configurePagesID() {
  
  var privacyPolicyFileID = Browser.inputBox("Enter the file ID of your Privacy Policy google doc", "Privacy Policy File ID", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("privacyPolicyFileID", privacyPolicyFileID.trim()); 
  
  var termsOfUseFileID = Browser.inputBox("Enter the file ID of your Terms of Use google doc", "Terms of Use File ID", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("termsOfUseFileID", termsOfUseFileID.trim()); 
                     
  var wfdfProgramsFileID = Browser.inputBox("Enter the file ID of your WFDF Development Programs FileID google doc", "WFDF Development Programs File ID", Browser.Buttons.OK);
  PropertiesService.getScriptProperties().setProperty("wfdfProgramsFileID", wfdfProgramsFileID.trim()); 
 }  

// ******************************************************************************************************
// Function to store the github email and pass, and store the authentication token for future calls
// NB: These details are stored as user properties, so they are not visible nor available to other users
// Using OAuth we coudl have a higher rate of calls... but so far I have not seen a reason to bother
// ******************************************************************************************************
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