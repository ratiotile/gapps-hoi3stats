function getUploadHtml(){
  return HtmlService.createTemplateFromFile('upload.html').evaluate()
}

// needed to make include work in html files
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function createUnitSheet(data){
  Logger.log("creating unit sheet")
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.insertSheet("UnitData")
  sheet.appendRow(data.columns)
  for(var i=0; i < data.rows.length; ++i){
    sheet.appendRow(data.rows[i])
  }
}
