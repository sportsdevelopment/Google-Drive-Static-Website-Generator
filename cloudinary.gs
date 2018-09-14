// ******************************************************************************************************
// Function to upload an image in gDrive to Cloudinary and apply a specific preset
// ******************************************************************************************************
function uploadImageToCloudinary(fileID, presetName){
 
  //https://cloudinary.com/documentation/upload_images#uploading_with_a_direct_call_to_the_api
  var base_url = 'https://api.cloudinary.com/v1_1/' + printVal("cloudinary_name") + '/image/upload'
  var fileContent = DriveApp.getFileById(fileID).getBlob().getBytes();
  var dummy = Utilities.base64Encode(fileContent)
  var formData = {
    'file': 'https://leadingpersonality.files.wordpress.com/2013/05/smile.jpg',
    'upload_preset': presetName //see https://cloudinary.com/console/settings/upload#upload_presets
  };
  var options = {
    'method' : 'post',
    'payload' : formData
  };
  UrlFetchApp.fetch(base_url, options);
  
}

