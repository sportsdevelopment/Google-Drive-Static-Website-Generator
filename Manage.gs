function createTestImage(){
  var fileID = '1LQZxsQPrNEtfsbTHkKDBhkbseV9NsnbI';
  var folder = 'images/favicon';
  var fileName = 'test';
  var path = generateImagePath(fileID, folder, fileName);
  createImageInGitHub(fileID, path);
}




function updateRow(){
  Logger.log('Start Update Row');
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetName = sheet.getName();
  var activeRow = SpreadsheetApp.getActiveRange().getRow();
  var lastCol = sheet.getLastColumn();
  var date = new Date();
  var rowDataOutput = sheet.getRange(activeRow, 1, activeRow, lastCol).getValues();
  var creationDate = sheet.getRange(activeRow, lastCol-1).getValue();
  switch(sheetName){
    case 'CorePages': 
      if (creationDate){
        Logger.log('Update Page');
        var itWorked = updatePageFromRowData(rowDataOutput[0]);
        var outCol = lastCol;
      } else {
        Logger.log('Create Page');
        var itWorked = createPageFromRowData(rowDataOutput[0]);
        var outCol = lastCol-1;
      }
      break;
    
    case 'Projects':
      if (creationDate){
        Logger.log('Update Project');
        var itWorked = updateProjectFromRowData(rowDataOutput[0]);
        var outCol = lastCol;
      } else {
        Logger.log('Create Project');
        var itWorked = createProjectFromRowData(rowDataOutput[0]);
        var outCol = lastCol-1;
      }
      break;
      
    default:
      //do nothing
  }
  
  if(itWorked){ 
    var range = sheet.getRange(activeRow,outCol);
    range.setValue(date); 
  }
  
}


function updateAllProjects(){
  Logger.log('Start Update All Projects');
  var sheet = SpreadsheetApp.getActive().getSheetByName('Projects');
  
  //get all values
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var pageVals = sheet.getRange(2, 1, lastRow, lastCol).getValues();

  var updateTime = [];
  
  //update all
  for (var i=0; i<lastRow-1; i++){    
    Logger.log('Update Row '+i);
    var rowData = pageVals[i];
    var itWorked = updateProjectFromRowData(rowData); 
    if(itWorked) {
      var date = new Date();
    } else {
      var date = ""; 
    }
    updateTime.push([date]);
  }
  
  var range = sheet.getRange(2,lastCol,lastRow,lastCol);
  range.setValues(updateTime);
  
}


function updateAllCorePages(){
  Logger.log('Start Update All Pages');
  var sheet = SpreadsheetApp.getActive().getSheetByName('CorePages');
  
  //get all values
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var pageVals = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  
  var updateTime = [];
  //update all
  for (var i=0; i<lastRow-1; i++){  
    Logger.log('Update Row '+i);
    var rowData = pageVals[i];
    var itWorked = updatePageFromRowData(rowData); 
    if(itWorked) {
      var date = new Date();
    } else {
      var date = ""; 
    }
    updateTime.push([date]);
  }
  
  var range = sheet.getRange(2,lastCol,lastRow,lastCol);
  range.setValues(updateTime);
}


function updateMainCSS() {
  Logger.log('Update main CSS');
  var fileContent = getContent('main.css');
  var path = 'css/main.css';
  var css_version = printVal('css_version');
  var new_css_version = parseInt(css_version,10) + 1;
  var itWorked = updateFile(path, fileContent);
  if (itWorked){
    PropertiesService.getScriptProperties().setProperty("css_version", new_css_version.toString() );  
  }
}

function updateMainJS() {
  Logger.log('Update main JS');
  var fileContent = getContent('main.js');
  var path = 'js/main.js';
  var js_version = printVal('js_version');
  var new_js_version = parseInt(js_version,10) + 1;
  var itWorked = updateFile(path, fileContent);
  if (itWorked){
    PropertiesService.getScriptProperties().setProperty("js_version", new_js_version.toString() );   
  }
}

function updateSiteMap(){
  Logger.log('Update sitemap');
  var fileContent = createSiteMapContent();
  var path = 'sitemap.txt';
  updateFile(path,fileContent) 
}


// ******************************************************************************************************
// Function to create a project page
// ******************************************************************************************************
function createProjectFromRowData(rowData) {
  
  var idString = rowData[0];
  var on_homepage = rowData[1];
  var is_published = rowData[2];
  var meta_title = rowData[3];
  var page_url = 'projects/' + rowData[4] + '.html';
  var short_title = rowData[5];
  var headline = rowData[6];
  var theme = rowData[7];
  var country = rowData[8];
  var img_thumb = rowData[9];
  var headerImage_url = rowData[10];
  var quote = rowData[11];
  var descriptionGdocID = rowData[12];
  var carouselImages = rowData[13];
  var embedCode = rowData[14];
  var money_url = rowData[15];
  var money_text = rowData[16];
  var equipment_url = rowData[17];
  var equipment_text = rowData[18];
  var service_url = rowData[19];
  var service_text = rowData[20];
  var has_team = rowData[21];
  var facebook_url = rowData[22];
  var twitter_url = rowData[23];
  var site_url = rowData[24];
  var date_published = rowData[25];
  var date_updated = rowData[26];
  
  Logger.log('Start creation of project ID ' + idString)
  if (is_published==1){
    Logger.log('Project is ready to be published');
    var fileContent = generateProjectHTML(idString,on_homepage,is_published,meta_title,page_url,short_title,headline,theme,country,img_thumb,headerImage_url, quote,descriptionGdocID,carouselImages,embedCode,money_url,money_text,equipment_url,equipment_text,service_url,service_text,has_team,facebook_url,twitter_url,site_url);
    var isCreated = createFile(page_url,fileContent)
    
    //create folder for images
    var fileContent2 = 'id: ' + idString + ', create_date: ' + Date.now();
    var page_url2 = page_url.substring(0, page_url.length-5) + '/created.html';
    var isCreated2 = createFile(page_url2,fileContent2);
    if(isCreated2) { Logger.log('Project folder is ready'); }
    
    return isCreated;
    
  }
}

// ******************************************************************************************************
// Function to update a project page
// ******************************************************************************************************
function updateProjectFromRowData(rowData) {
  
  var idString = rowData[0];
  var on_homepage = rowData[1];
  var is_published = rowData[2];
  var meta_title = rowData[3];
  var page_url = 'projects/' + rowData[4] + '.html';
  var short_title = rowData[5];
  var headline = rowData[6];
  var theme = rowData[7];
  var country = rowData[8];
  var img_thumb = rowData[9];
  var headerImage_url = rowData[10];
  var quote = rowData[11];
  var descriptionGdocID = rowData[12];
  var carouselImages = rowData[13];
  var embedCode = rowData[14];
  var money_url = rowData[15];
  var money_text = rowData[16];
  var equipment_url = rowData[17];
  var equipment_text = rowData[18];
  var service_url = rowData[19];
  var service_text = rowData[20];
  var has_team = rowData[21];
  var facebook_url = rowData[22];
  var twitter_url = rowData[23];
  var site_url = rowData[24];
  var date_published = rowData[25];
  var date_updated = rowData[26];
  
  if (is_published==1){
    var fileContent = generateProjectHTML(idString,on_homepage,is_published,meta_title,page_url,short_title,headline,theme,country,img_thumb,headerImage_url, quote,descriptionGdocID,carouselImages,embedCode,money_url,money_text,equipment_url,equipment_text,service_url,service_text,has_team,facebook_url,twitter_url,site_url);
    var isCreated = updateFile(page_url,fileContent)
  }
  return isCreated;
}



// ******************************************************************************************************
// Function to update a core page
// ******************************************************************************************************
function updatePageFromRowData(rowData){
  Logger.log('Update page from row');
  var page_type = rowData[0];
  var page_source = rowData[1];
  var is_published = rowData[2];
  var page_url = rowData[3];
  var meta_title = rowData[4];
  var meta_description = rowData[5];
  var body_classes = rowData[6];
  
  if (is_published==1) {
      switch(page_type){
          
        case 'script':
          Logger.log('Update from script');
          var isCreated = updateFile(page_url, createHTML(rowData[1], meta_title + '- WFDF Development', body_classes, page_url, meta_description) );
        break;
        
        case 'sheet':
          Logger.log('Update from sheet');
          var isCreated = updateFile(page_url, JSON.stringify(sheet2Json(rowData[1])) );
        break;
        
        case 'gdoc':
          Logger.log('Update from gdoc');
          var isCreated = updateFile(page_url, createHTMLfromGdoc(rowData[1], meta_title + '- WFDF Development', body_classes, page_url, meta_description) );
        break;
        
        default:
        //do nothing
    }
  } 
  return isCreated;
}



// ******************************************************************************************************
// Function to update a core page
// ******************************************************************************************************
function createPageFromRowData(rowData){
  Logger.log('Create page from row');
  var page_type = rowData[0];
  var page_source = rowData[1];
  var is_published = rowData[2];
  var page_url = rowData[3];
  var meta_title = rowData[4];
  var meta_description = rowData[5];
  var body_classes = rowData[6];
  
  if (is_published==1) {
      switch(page_type){
          
        case 'script':
          Logger.log('Create from script');
          var isCreated = createFile(page_url, createHTML(rowData[1], meta_title + '- WFDF Development', body_classes, page_url, meta_description) );
        break;
        
        case 'sheet':
          Logger.log('Create from sheet');
          var isCreated = createFile(page_url, JSON.stringify(sheet2Json(rowData[1])) );
        break;
        
        case 'gdoc':
          Logger.log('Create from gdoc');
          var isCreated = createFile(page_url, createHTMLfromGdoc(rowData[1], meta_title + '- WFDF Development', body_classes, page_url, meta_description) );
        break;
        
        default:
        //do nothing
    }
  }
  return isCreated;
}