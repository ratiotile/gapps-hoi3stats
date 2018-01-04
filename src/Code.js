function getUploadHtml(){
  return HtmlService.createTemplateFromFile('upload.html').evaluate()
}

// needed to make include work in html files
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
