function createSampleDoc() {
  var doc = DocumentApp.create('Sample Document');
  var body = doc.getBody();
  var rowsData = [['Plants', 'Animals'], ['Ficus', 'Goat'], ['Basil', 'Cat'], ['Moss', 'Frog']];
  body.insertParagraph(0, doc.getName())
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
  table = body.appendTable(rowsData);
  table.getRow(0).editAsText().setBold(true);
}


function testStoreImageinGDrive(){
  var imageURL = "https://leadingpersonality.files.wordpress.com/2013/05/smile.jpg";
  var image = UrlFetchApp.fetch(imageURL); 
  var imageBlob = image.getBlob();
  DriveApp.createFile(imageBlob);
  //The image is created in the root folder
}


// see https://developers.google.com/apps-script/reference/drive/drive-app#searchFolders(String)
function getFoldersToLog(){
  var out = DriveApp.getFolders();
  Logger.log(out)  
}

function getFilesToLog(){
  var out = DriveApp.getFiles()
  Logger.log(out)  
}

function getHTMLfromGDocID(fileID){
  var forDriveScope = DriveApp.getStorageUsed();
  var url = "https://docs.google.com/feeds/download/documents/export/Export?id="+fileID+"&exportFormat=html";
  var param = {
    method      : "get",
    headers     : {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
    muteHttpExceptions:true,
  };
  var entirePageHTML = UrlFetchApp.fetch(url,param).getContentText();
  
  //remove the gdrive <style>
  var bodyHtml = /<body.*?>([\s\S]*)<\/body>/.exec(entirePageHTML)[1];
  
  //remove the warning on the links being redirected
  bodyHtml = updateLinksInHTML(bodyHtml).replace(/https:\/\/www.google.com\/url\?q=/g,'');
  
  return(bodyHtml);  
}


function updateLinksInHTML(html) {
       
  //remove what google adds at the beginning of the href
  html = html.replace(/https:\/\/www.google.com\/url\?q=/g,'');

  //remove what it adds at the end, too

  var regex = /href\s*=\s*(['"])(https?:\/\/.+?)\1/ig;   
  var link;
  while((link = regex.exec(html)) !== null) {
    html = html.replace(link[2], link[2].substring(0, link[2].indexOf('&')));
  }
  
  return html;
  
}


function getFileContentFromName(fileName) {
  var files = DriveApp.getFilesByName(fileName);
  while (files.hasNext()) {
    var file = files.next();
    var fileID = file.getId();
    var fileContent = DriveApp.getFileById(fileID).getBlob().getDataAsString();
    Logger.log(fileContent);
  }
}