function updateAllProjects(){
  var sheet = SpreadsheetApp.getActive().getSheetByName('Projects');
  
  //get all values
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(2, 1, lastRow, 1);
  var projIDs = range.getValues();
  var pLength = projIDs.length;
  for (var i=0; i<pLength; i++){
    var index = projIDs[i];
    if (index) {
      updateProjectPage(index);
    }
  }
}


function createTestImage(){
  var fileID = '1154hFm_EBRxiCCNX9NSvhbbMLJE5u945';
  var folder = 'images';
  var fileName = 'test';
  var path = generateImagePath(fileID, folder, fileName);
  createImageInGitHub(fileID, path);
}



function updateCorePages() {
  updatePage('index.html', createHTML('page_home', 'WFDF Development - Home', 'homepage') );
  
  updatePage('certificates/certificates.json', JSON.stringify(sheet2Json('Certificates')) );
  updatePage('certificates.html', createHTML('page_certificates', 'Skill Certificates - WFDF Development', 'utility-page') );

  updatePage('projects/projects.json', JSON.stringify(sheet2Json('Projects')) );
  updatePage('projects.html', createHTML('page_projects', 'WFDF Development - Projects', 'utility-page') );
  
  updatePage('resources/resources.json', JSON.stringify(sheet2Json('Resources')) );
  updatePage('resources.html', createHTML('page_resources', 'WFDF Development - Resources', 'utility-page') );
  
  updatePage('wfdf-development-programs.html', createUtilityPageHTML(printVal(wfdfProgramsFileID), 'WFDF Development Programs - WFDF Development') );
    
  updatePage('privacy-policy.html', createUtilityPageHTML(printVal(privacyPolicyFileID), 'Privacy Policy - WFDF Development') );
  updatePage('terms-of-use.html', createUtilityPageHTML(printVal(termsOfUseFileID), 'Terms of use - WFDF Development'));
   
}



function updateMainCSS() {
  var fileContent = getContent('main.css');
  var path = 'css/main.css';
  var css_version = printVal('css_version');
  var new_css_version = parseInt(css_version,10) + 1;
  PropertiesService.getScriptProperties().setProperty("css_version", new_css_version.toString() ); 
  updatePage(path, fileContent);
}

function updateMainJS() {
  var fileContent = getContent('main.js');
  var path = 'js/main.js';
  var js_version = printVal('js_version');
  var new_js_version = parseInt(js_version,10) + 1;
  PropertiesService.getScriptProperties().setProperty("js_version", new_js_version.toString() ); 
  updatePage(path, fileContent);
}


function createProjectPage(id) {
  var fileContent = generateProjectHTML(id);
  var path = "projects/" + id.toString() + '.html';
  createFile(path,fileContent)
}

function updateProjectPage(id) {
  var fileContent = generateProjectHTML(id);
  var path = "projects/" + id.toString() + '.html';
  updatePage(path, fileContent);
}


function createCarouselJSON(path){
  //carousel json
  var outJson = sheet2Json('Carousel');
  var fileContent = JSON.stringify(outJson);
  createFile(path, fileContent);
}

//function needed only once to initialise the whole project
function generateAllCoreFiles() {
  
  //home
  createFile('index.html', createHTML('page_home', 'WFDF Development - Home', 'homepage'));
  
  //projects json
  createFile('projects/projects.json', JSON.stringify(sheet2Json('Projects')));
  
  //Projects page
  createFile('projects.html', createHTML('page_projects', 'WFDF Development - Projects', 'utility-page'));

  //resources json
  createFile('resources/resources.json', JSON.stringify(sheet2Json('Resources')));
  
  //Resources page
  createFile('resources.html', createHTML('page_resources', 'WFDF Development - Projects', 'utility-page'));
    
  //Privacy policy
  createFile('privacy-policy.html', createUtilityPageHTML(printVal(privacyPolicyFileID), 'Privacy Policy - WFDF Development'));
  
  //resources json
  createFile('certificates/certificates.json', JSON.stringify(sheet2Json('Certificates')));
  
  //Certificates
  createFile('certificates.html', createHTML('page_certificates', 'Skill Certificates - WFDF Development', 'utility-page'));
  
  //Terms
  createFile('terms-of-use.html', createUtilityPageHTML(printVal(termsOfUseFileID), 'Terms of use - WFDF Development'));
  
  //wfdf programs
  createFile('wfdf-development-programs.html', createUtilityPageHTML(printVal(wfdfProgramsFileID), 'WFDF Development Programs - WFDF Development') );

}



