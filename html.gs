// ******************************************************************************************************
// Function to return the full HTML of a page by stitching together all page components
// ******************************************************************************************************
function createHTML(pageID, pageTitle, bodyClass) {
  
  var html = '<!DOCTYPE html>' +
             '<html>' +
               '<head>' +
                 createGoogleScriptSnippets() +
                 '<base target="_top">' + 
                  getContent('template_head') +                   
                  '<title>' + pageTitle + '</title>' +
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
function createUtilityPageHTML(pageID, pageTitle, bodyClass) {
  
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
function generateProjectHTML(id) {
  
  var html = '';
  var idString = id.toString();
  var data = sheet2Json('Projects');
  //filter the data to get the project with the required id
  var projectDataArray = data.filter(function (entry) {
    return entry.id == idString;
  });
  //the above returns an array - you want just the first item
  var projectData = projectDataArray[0];
  
  var bodyClass = 'project-page';

  html += '<!DOCTYPE html>' +
            '<html>' +
              '<head>' +
                createGoogleScriptSnippets() +
                '<base target="_top">' + 
                getContent('template_head') +                   
                '<title>' + projectData.title + ' - WDFD Development</title>' +
                createLinksToJSandCSS() +  
              '</head>' +
              '<body id="page-top" class="' + bodyClass + '">' +
                getContent('template_navigation');  
               
	
  // Header
  var headerImage_url = projectData.headerImage_url;
  if(!headerImage_url) { headerImage_url = '/images/header.jpg';}    
    html += '<header class="masthead" style="background-image: url(' + headerImage_url + ')">' +
			  '<div class="container">' +
				'<div class="intro-text">' +
					'<div class="intro-lead-in">' + projectData['headline'] + '</div>' +
					'<div class="intro-heading text-uppercase">' + projectData['title'] + '</div>' +
					'<a class="btn btn-primary btn-xl text-uppercase js-scroll-trigger" href="#donate">Give</a>' +
				'</div>' +
			  '</div>' +
			'</header>';

  // Project description - you have 3 rows
  html += '<section id="description">' +
     	    '<div class="container">';
    
  if (projectData.quote) { 
    html += '<div class="row">' +
              '<div class="col-lg-12">' +
                '<blockquote class="blockquote">' +
                  '<p>' +
                    projectData.quote +
                  '</p>' +    
                '</blockquote>' +   
              '</div>' +
            '</div>';
  }
    
  if (projectData.description) { 
    html += '<div class="row">' +
              '<div class="col-lg-12">' +
                getHTMLfromGDocID(projectData.description) +
              '</div>' +
            '</div>';
  }
    	
  if (projectData.carouselJSON) { 
    var carouselID = 'carousel-' + id;
    html += '<div class="row">' +
              '<div class="col-lg-12">' +
                generateCarousel(carouselID, projectData.carouselJSON) +
              '</div>' +
            '</div>';
  }
	
  html += '</section>';

	
  
  // Donate section - up to 3 calls to action
  var colCount = 0;
  if(projectData.money_url) { colCount = colCount+1 }
  if(projectData.equipment_text) { colCount = colCount+1 }
  if(projectData.service_text) { colCount = colCount+1 }
	
  if (colCount> 0) {
    var colSize = 12/colCount;
    
    html += '<section id="donate">' +
              '<div class="container">' +
				'<div class="row text-center">';
				  if(projectData.money_url) {
					html += '<div class="col-md-' + colSize + '">' +
							  '<a class="cta cta-ask cta-button" data-toggle="modal" href="' + projectData.money_url +'">' +
								'<span class="fa-stack fa-4x">' +
								  '<i class="fa fa-circle fa-stack-2x text-primary"></i>' +
								  '<i class="fa fa-question fa-stack-1x fa-inverse"></i>' +
								'</span>' +
							  '</a>' +
							  '<h4 class="service-heading">' +
							    '<a class="cta cta-ask cta-text" data-toggle="modal" href="' + projectData.money_url + '">Donate</a>' +
							  '</h4>' +
							  '<p class="text-muted">' + projectData.money_text + '</p>' +
							'</div>';
				  }
						
				  if(projectData.equipment_text) {
					if (!projectData.equipment_url) { projectData.equipment_url = '#give-equipment'}
					  html += '<div class="col-md-' + colSize + '">' +
					 		    '<a class="cta cta-ask cta-button" data-toggle="modal" href="' + projectData.equipment_url + '">' +
								  '<span class="fa-stack fa-4x">' +
									'<i class="fa fa-circle fa-stack-2x text-primary"></i>' +
									'<i class="fa fa-question fa-stack-1x fa-inverse"></i>' +
								  '</span>' +
								'</a>' +
								'<h4 class="service-heading">' +
								  '<a class="cta cta-ask cta-text" data-toggle="modal" href="' + projectData.equipment_url + '">Give</a>' +
								'</h4>' +
								'<p class="text-muted">' + projectData.equipment_text + '</p>' +
							  '</div>';
				  }
						
				  if(projectData.service_text) {
					if (!projectData.service_url) { projectData.service_url = '#give-service'}
					  html += '<div class="col-md-' + colSize + '">' +
								'<a class="cta cta-ask cta-button" data-toggle="modal" href="' + projectData.service_url + '">' +
					   			  '<span class="fa-stack fa-4x">' +
									'<i class="fa fa-circle fa-stack-2x text-primary"></i>' +
									'<i class="fa fa-question fa-stack-1x fa-inverse"></i>' +
								  '</span>' +
								'</a>' +
								'<h4 class="service-heading">' +
								  '<a class="cta cta-ask cta-text" data-toggle="modal" href="' + projectData.service_url + '">Give</a>' +
								'</h4>' +
								'<p class="text-muted">' + projectData.service_text + '</p>' +
							  '</div>';
				  }

				  html += '</div>' +
				        '</div>' +
			          '</section>';
  }
	
  // Team - TODO
  if(projectData.has_team) {
    html += '<section class="bg-light" id="team">' +
			'</section>';
  }
  
  // Links - TODO
  var colCount = 0;
  if(projectData.facebook_url) { colCount = colCount+1 }
  if(projectData.twitter_url) { colCount = colCount+1 }
  if(projectData.site_url) { colCount = colCount+1 }
  
  if (colCount> 0) {
    var colSize = 12/colCount;
    
  }  
    
  html += getContent('template_footer') + 
        '</body>' +
      '</html>';  

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
// Function to generate the HTML for a carousel from a path to a JSON file
// ******************************************************************************************************
function generateCarousel(itemID, linksJSON){
    
  var html = '<div id="' + itemID + '" class="carousel slide" data-ride="carousel">';
  
  var data = linksJSON;
  
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
    var slideEl = data[j];
    switch(slideEl.type) {
      case 'image':
        html += '<div class="carousel-item' + isActive + '">' +
                  '<img src="' + slideEl.url + '">' +   
                '</div>';
        break;
      case 'youtube':
        html += '<div class="carousel-item' + isActive + '">' +
                  '<iframe src="' + slideEl.url + '" allow="autoplay; encrypted-media" allowfullscreen></iframe>' +
                '</div>';  
      default:
      //do nothing  
    }
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