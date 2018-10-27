/* 
Important: the REST calls are restricted by the Google Apps Script quotas. The two you are most likely to hit into are: 
1) The maximum runtime for a script is 6 minutes. Individual scripts have a limit of 30 seconds. 
2) The URLfetch (the HTTP/HTTPS service used to make the API calls) has a 20MB maximum payload size per call.
   For full details, see https://developers.google.com/apps-script/guides/services/quotas   
*/


// ******************************************************************************************************
// Function to display the HTML as a webApp
// ******************************************************************************************************
function doGet(e) {
  
  //you can also pass a parameter via the URL as ?add=XXX 

  var template = HtmlService.createTemplateFromFile('project_dashboard');  

  var htmlOutput = template.evaluate()
                   .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                   .setTitle('Dashboard for WFDF Development')
                   .addMetaTag('viewport', 'width=device-width, initial-scale=1')
                   .setFaviconUrl('http://threeflamesproductions.com/wp-content/uploads/2017/01/Favicon_ThreeFlames_FireIcon_Color.png');

  return htmlOutput;
};



// ******************************************************************************************************
// Function to print out the content of a file
// ******************************************************************************************************
function getContent(filename) {
  var pageContent = HtmlService.createTemplateFromFile(filename).getRawContent();
  return pageContent;
}



// ******************************************************************************************************
// Function to shortcut writing a call for a user property
// ******************************************************************************************************
function printVal(key) {

  if (key == "git_token" || key == "git_user") {
     var dummy = PropertiesService.getUserProperties().getProperty(key);    
  } else {
     var dummy = PropertiesService.getScriptProperties().getProperty(key);    
  }
  return dummy;
  //TODO - add logic for when the property is not defined
}



// ******************************************************************************************************
// Get the content of a google sheet and convert it into a json
// if there is a column called 'is_published', only rows with value 1 in that column will be printed in the JSON
// if a column name has the string "_hidden"
// ******************************************************************************************************
function sheet2Json(sheetName) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  
  //get all values
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn()
  var range = sheet.getRange(1, 1, lastRow, lastCol);
  var allValues = range.getValues();
  
  //first row is for the property titles
  var titleColumns = allValues[0];
  var isFiltered = titleColumns.indexOf('is_published');
  // create json
  var jsonArray = [];
  for(var i=1; i<lastRow; i++) {
    var line = allValues[i];
    var json = new Object();
    for(var j=0; j<lastCol; j++) {
      if (titleColumns[j].indexOf("_hidden") == -1){
        json[titleColumns[j]] = line[j];
      }
    }
    if (isFiltered != -1){
      if (json['is_published'] == 1) {
        jsonArray.push(json);
      }
    } else {
      jsonArray.push(json);
    }
  }
  return jsonArray;
}


// ******************************************************************************************************
// Take the output of a google form with a list of image files, and create an array with the file IDS
// ******************************************************************************************************
function generateFileIDArrayFromFileList(fileList){
  var stringsArray = fileList.split(' ,');
  var outArray = [];
  for(var i=0; i<stringsArray.length; i++) {
    var fileID = stringsArray[i].split('=')[1];
    outArray.push(fileID);
  }
  return outArray;
}



// ******************************************************************************************************
// Take the folder and file name and generate the output URL
// ******************************************************************************************************
function generateImagePath(fileID, folder, fileName){
  var fileType = DriveApp.getFileById(fileID).getMimeType();
  switch(fileType) {
    case 'image/bmp':
      var fileExt = '.bmp';
      break;
    case 'image/gif':
      var fileExt = '.gif';
      break;
    case 'image/jpeg':
      var fileExt = '.jpg';
      break;
    case 'image/png':
      var fileExt = '.png';
      break;
    default:
      //nothing      
  }
  
  //Add a / at the end of the folder name if necessary
  if (folder.length > 0 && folder.slice(-1) != "/") { folder += "/" }
  
  var path = folder + fileName + fileExt;
  
  return path;
}


// ******************************************************************************************************
// Take the folder and the output of generateFileIDArrayFromFileList, and generate the JSON for the carousel
// ******************************************************************************************************
function createJSONFromArray(folder, fileIDArray){

  // create json
  var jsonArray = [];  
  for(var i=0; i<fileIDArray.length; i++) {
    var json = new Object();
    
    json['type'] = 'image';
    
    var fileID = fileIDArray[i];
    var fileName = 'image_' + i;
    var path = generateImagePath(fileID, folder, fileName);
    json['url'] = path;
    
    jsonArray.push(json);
  }  
  return jsonArray;  
}



// ******************************************************************************************************
// Function to convert a string into a SEO-friendly URL
// from https://stackoverflow.com/questions/14107522/producing-seo-friendly-url-in-javascript
// ******************************************************************************************************
function createUrl(textToConvert) {
    return textToConvert.toString()               // Convert to string
        .replace(/[\u0300-\u036f]/g,'') // Remove illegal characters
        .replace(/\s+/g,'-')            // Change whitespace to dashes
        .toLowerCase()                  // Change to lowercase
        .replace(/&/g,'-and-')          // Replace ampersand
        .replace(/[^a-z0-9\-]/g,'')     // Remove anything that is not a letter, number or dash
        .replace(/-+/g,'-')             // Remove duplicate dashes
        .replace(/^-*/,'')              // Remove starting dashes
        .replace(/-*$/,'');             // Remove trailing dashes
}


function getProjectURL(id){
  var idString = id.toString();
  var data = sheet2Json('Projects');
  //filter the data to get the project with the required id
  var projectDataArray = data.filter(function (entry) {
    return entry.id == idString;
  });
  //the above returns an array - you want just the first item
  var projectData = projectDataArray[0];
  if (projectData){
    var path = "projects/" + projectData.url + '.html'
    return path;
  }
}
