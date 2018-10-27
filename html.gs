// ******************************************************************************************************
// Function to return the full HTML of a page by stitching together all page components
// ******************************************************************************************************
function createHTML(pageID, pageTitle, bodyClass, canonicalURL, description) {
  
  var html = '<!DOCTYPE html>' +
             '<html>' +
               '<head>' +
                 createGoogleScriptSnippets() +
                 '<base target="_top">' + 
                  getContent('template_head') +                   
                  '<title>' + pageTitle + '</title>' +
                  '<meta name="description" content="' + description + '" />' +
                  '<link rel="canonical" href="http://development.wfdf.org/' + canonicalURL + '" />' +
                  createLinksToJSandCSS() +  
               '</head>' +
               '<body id="page-top" class="' + bodyClass + '">' +
                 getContent('template_navigation') +  
                 getContent(pageID) +
                 getContent('template_footer') + 
               '</body>' +
             '</html>'  
  return html;               
}


// ******************************************************************************************************
// Function to return the full HTML of a page by stitching together different page components
// ******************************************************************************************************
function createHTMLfromGdoc(pageID, pageTitle, bodyClass, canonicalURL, description) {
  
  if (typeof bodyClass === 'undefined') { 
    bodyClass = ' ' + bodyClass; 
  } else {
     bodyClass = ''; 
  }
  
  var pageBody = '<section>' +
                   '<div class="container">' +
		             '<div class="row">' +
		               '<div class="col-lg-12">' +
                         getHTMLfromGDocID(pageID) +
                       '</div>' +
		             '</div>' +
	               '</div>' +
                 '</section>'; 
  
  var html = '<!DOCTYPE html>' +
             '<html>' +
               '<head>' +
                 createGoogleScriptSnippets() +
                 '<base target="_top">' + 
                  getContent('template_head') +                   
                  '<title>' + pageTitle + '</title>' +
                  '<meta name="description" content="' + description + '" />' +
                  '<link rel="canonical" href="http://development.wfdf.org/' + canonicalURL + '" />' +
                    createLinksToJSandCSS() +  
               '</head>' +
               '<body id="page-top" class="utility-page' + bodyClass + '">' +
                 getContent('template_navigation') +  
                 pageBody +
                 getContent('template_footer') + 
               '</body>' +
             '</html>'  
  return html;               
}




// ******************************************************************************************************
// Function to generate the HTML for a project page
// ******************************************************************************************************
function generateProjectHTML(idString,on_homepage,is_published,meta_title,page_url,short_title,headline,theme,country,img_thumb,headerImage_url, quote,descriptionGdocID,carouselImages,embedCode,money_url,money_text,equipment_url,equipment_text,service_url,service_text,has_team,facebook_url,twitter_url,site_url) {
  
  Logger.log('Generating project HTML');
  
  var html = '';
  
  html += '<!DOCTYPE html>' +
            '<html>' +
              '<head>' +
                createGoogleScriptSnippets() +
                '<base target="_top">' + 
                getContent('template_head') +                   
                '<title>' + meta_title + ' - WDFD Development</title>' +
                '<meta name="description" content="' + short_title + ' ' + headline + '" />' +
                '<link rel="canonical" href="http://development.wfdf.org/' + page_url + '" />' +  
                createLinksToJSandCSS() +  
              '</head>' +
              '<body id="page-top" class="project-page">' +
                getContent('template_navigation');  
               
  
  // Header
  if(!headerImage_url) { headerImage_url = '/images/header.jpg';}    
  html += '<header class="masthead" style="background-image: url(' + headerImage_url + ')">' +
 	        '<div class="container">' +
		      '<div class="intro-text">' +
			    '<div class="intro-lead-in">' + headline + '</div>' +
			    '<div class="intro-heading text-uppercase">' + meta_title + '</div>' +
				'<a class="btn btn-primary btn-xl text-uppercase js-scroll-trigger" href="#donate">Give</a>' +
			  '</div>' +
			'</div>' +
		  '</header>';

  // Project description - you have 3 rows
  html += '<section id="description">' +
            '<div class="container">';
    
  if (quote) { 
    html += '<div class="row">' +
              '<div class="col-lg-12">' +
                '<blockquote class="blockquote">' +
                  '<p>' +
                    quote +
                  '</p>' +    
                '</blockquote>' +   
              '</div>' +
            '</div>';
  }
  
  if (descriptionGdocID) { 
    html += '<div class="row">' +
              '<div class="col-lg-12">' +
                getHTMLfromGDocID(descriptionGdocID) +
              '</div>' +
            '</div>';
  }
    
  if (embedCode) { 
    html += '<div class="row text-center">' +
              embedCode +
            '</div>';
  }
    
  if (carouselImages) { 
    var carouselID = 'carousel-' + idString;
    html += '<div class="row">' +
              '<div class="col-lg-12">' +
                generateCarouselFromList(carouselID, carouselImages) +
              '</div>' +
            '</div>';
  }
    
  html += '</section>';
     
  // Donate section - up to 3 calls to action
  var colCount = 0;
  if(money_url) { colCount = colCount+1 }
  if(equipment_url) { colCount = colCount+1 }
  if(service_url) { colCount = colCount+1 }
    
  if (colCount> 0) {
    var colSize = 12/colCount;
      
    html += '<section id="donate">' +
              '<div class="container">' +
                '<div class="row text-center">';
    //donate
    if(money_url) {
      if (!money_text) { money_text = ''; }
      html += '<div class="col-md-' + colSize + '">' +
                '<a class="cta cta-ask cta-button" target="_blank" href="' + money_url +'">' +
                  '<span class="fa-stack fa-4x">' +
                    '<i class="fa fa-circle fa-stack-2x text-primary"></i>' +
                    '<i class="fa fa-donate fa-stack-1x fa-inverse"></i>' +
                  '</span>' +
                '</a>' +
                '<h4 class="service-heading">' +
                  '<a class="cta cta-ask cta-text" target="_blank" href="' + money_url + '">Donate</a>' +
                '</h4>' +
                '<p class="text-muted">' + money_text + '</p>' +
              '</div>';
    }
      
    //give
    if(equipment_url) {
      if (!equipment_text) { equipment_text = ''; }
      html += '<div class="col-md-' + colSize + '">' +
                '<a class="cta cta-ask cta-button" target="_blank" href="' + equipment_url + '">' +
                  '<span class="fa-stack fa-4x">' +
                    '<i class="fa fa-circle fa-stack-2x text-primary"></i>' +
                    '<i class="fa fa-gift fa-stack-1x fa-inverse"></i>' +
                  '</span>' +
                '</a>' +
                '<h4 class="service-heading">' +
                  '<a class="cta cta-ask cta-text" target="_blank" href="' + equipment_url + '">Give</a>' +
                '</h4>' +
                '<p class="text-muted">' + equipment_text + '</p>' +
              '</div>';
    }
      
    //get involved
    if(service_url) {
      if (!service_text) { service_text = ''}
      html += '<div class="col-md-' + colSize + '">' +
                '<a class="cta cta-ask cta-button" target="_blank" href="' + service_url + '">' +
                  '<span class="fa-stack fa-4x">' +
                    '<i class="fa fa-circle fa-stack-2x text-primary"></i>' +
                    '<i class="fa fa-user-circle fa-stack-1x fa-inverse"></i>' +
                  '</span>' +
                '</a>' +
                '<h4 class="service-heading">' +
                  '<a class="cta cta-ask cta-text" target="_blank" href="' + service_url + '">Get involved</a>' +
                '</h4>' +
                '<p class="text-muted">' + service_text + '</p>' +
              '</div>';
    }
      
    html += '</div>' +
          '</div>' +
        '</section>';
  } else {
    html += '<style>.intro-text .btn {display: none;}</style>';
  }
      
  // Links - TODO
  //var colCount = 0;
  //if(projectData.facebook_url) { colCount = colCount+1 }
  //if(projectData.twitter_url) { colCount = colCount+1 }
  //if(projectData.site_url) { colCount = colCount+1 }
   
  // if (colCount> 0) {
  //   var colSize = 12/colCount; 
  // }  
    
  html += getContent('template_footer') + 
        '</body>' +
      '</html>';  
  
  Logger.log("Project HTML completed.");  
  return html;
  

}	
  

// ******************************************************************************************************
// Function to return links to the main css and JS files with their respective version numbers
// ******************************************************************************************************
function createLinksToJSandCSS() {
  var out = '<script src="js/main.js?v=' + printVal('js_version') + '"></script>' +
            '<link href="/css/main.css?v=' + printVal('css_version') + '" rel="stylesheet">';
  return out;
}


// ******************************************************************************************************
// Function to return the code to run Google Analytics, Google Tag Manager, and Google Optimize
// ******************************************************************************************************
function createGoogleScriptSnippets(){
  var html = ''
  var ga_trackingID = printVal('ga_trackingID');
  var gOptimiseID = printVal('gOptimiseID');
  
  // Add function to disable tracking if the opt-out cookie exists.
  html += "<script> " +    
            "var disableStr = 'ga-disable-" + ga_trackingID + "'; " +
            "var gat_gtagStr = '_gat_gtag_" + ga_trackingID + "'; " +
            "if (document.cookie.indexOf(disableStr + '=true') > -1) { window[disableStr] = true; } " +
            "function delete_cookie(name) {" +
              "var expires = new Date(0).toUTCString(); " +
              "var domain = location.hostname.replace(/^www\./i, ''); " +
              "document.cookie = name + '=; expires=' + expires + '; path=/; domain=.' + domain;" +
            "}" + 
            "function gaOptout() { " +
              "delete_cookie('_ga'); " +
              "delete_cookie(gat_gtagStr); " +
              "delete_cookie('_gid'); " +
              "document.cookie = disableStr + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/'; " +
              "window[disableStr] = true; " + 
            "} " +
          "</script>";
  
  html += "<style>.async-hide { opacity: 0 !important} </style>" +
          "<script>" + 
            "(function(a,s,y,n,c,h,i,d,e){s.className+=' '+y;h.start=1*new Date;" +
            "h.end=i=function(){s.className=s.className.replace(RegExp(' ?'+y),'')};" +
            "(a[n]=a[n]||[]).hide=h;setTimeout(function(){i();h.end=null},c);h.timeout=c;" +
            "})(window,document.documentElement,'async-hide','dataLayer',4000,{'" + gOptimiseID + "':true});" + 
          "</script>";

  //code from https://support.google.com/optimize/answer/7513085?hl=en  
  html += '<!-- Global site tag (gtag.js) - Google Analytics -->' +
          '<script async src="https://www.googletagmanager.com/gtag/js?id=' + ga_trackingID + '"></script>' +
          '<script>' +
            'window.dataLayer = window.dataLayer || []; ' +
            'function gtag(){dataLayer.push(arguments);} ';
  html +=   "gtag('js', new Date()); " +
            "gtag('config', '" + ga_trackingID + "', { 'optimize_id': '" + gOptimiseID + "', 'anonymize_ip': true });" +
          "</script>";
  
  return html;            
}



// ******************************************************************************************************
// Function to generate the HTML for a carousel from a comma-separated list of images
// ******************************************************************************************************
function generateCarouselFromList(itemID, linksText){
    
  var html = '<div id="' + itemID + '" class="carousel slide" data-ride="carousel">';
  
  var data = linksText.split(',');
  
  //indicators
  html += '<ul class="carousel-indicators">' +
            '<li data-target="#' + itemID + '" data-slide-to="0" class="active"></li>';
  
  for(var i=1; i<data.length; i++){
    html += '<li data-target="#' + itemID + '" data-slide-to="' + i + '"></li>';  
  }
  html += '</ul>'; 
    
    
  //carousel
  html += '<div class="carousel-inner">';
    
  var isActive = ' active';
  
  for(var j=0; j<data.length; j++){  
    var imageURL = data[j].trim();
    //TODO - change behavior based on type of input. For the time being, asssume we only have images
    html += '<div class="carousel-item' + isActive + '">' +
              '<img src="' + imageURL + '">' +   
            '</div>';
    isActive = '';
  }  
    
  html += '</div>';
    
    
  //controls
  html += '<a class="carousel-control-prev" href="#' + itemID + '" data-slide="prev">' +
            '<span class="carousel-control-prev-icon"></span>' +
          '</a>' +
          '<a class="carousel-control-next" href="#' + itemID + '" data-slide="next">' +
            '<span class="carousel-control-next-icon"></span>' +
          '</a>';
  
  
  html += '</div>';
  
  return html;   

}


// ******************************************************************************************************
// Function to generate the plaintext sitemap of the site
// ******************************************************************************************************
function createSiteMapContent(){
  
  var htmlList = '';
  
  var corePagesSheet = SpreadsheetApp.getActive().getSheetByName('CorePages');
  var clastRow = corePagesSheet.getLastRow();
  var cVals = corePagesSheet.getRange(2, 3, clastRow, 4).getValues();
  for (var i=0; i<clastRow-1; i++){   
    var is_published = cVals[i][0];
    if(is_published==1) {
      htmlList += 'https://development.wfdf.org/' + cVals[i][1] + ' \n';
    }
  }
  
  var projsSheet = SpreadsheetApp.getActive().getSheetByName('Projects');
  var plastRow = projsSheet.getLastRow();
  var pVals = projsSheet.getRange(2, 3, plastRow, 5).getValues();
  for (var j=0; j<plastRow-1; j++){   
    var is_published = pVals[j][0];
    if(is_published==1) {
      htmlList += 'https://development.wfdf.org/projects/' + pVals[j][2] + ' \n';
    }
  }
  
  return htmlList;
}

