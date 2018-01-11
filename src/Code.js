function showUnitUploadHtml(){
  deleteAndCreate("UnitData")
  sharedUpload('UploadUnits.html',
    'Upload unit *.txt files',
    "Select Select unit files from (% HOI3 install dir %)/tfh/units/",
    "postUnits" // passthrough in bound script to updateUnitSheet
  )
}

function showTechUploadHtml(){
  deleteAndCreate("TechData")
  sharedUpload('UploadTech.html',
    'Upload technologies and doctrine *.txt files',
    "Select tech/doctrine files from (% HOI3 install dir %)/tfh/technologies/",
    "postTechs" // passthrough in bound script to updateTechSheet
  )
}

function sharedUpload(filename, title, instructions, callback){
  var temp = HtmlService.createTemplateFromFile(filename)
  temp.template_data = {
    text: instructions,
    callback: callback
  }
  var html = temp.evaluate()
  SpreadsheetApp.getUi().showModalDialog(html, title)
}

// needed to make include work in html files
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
// called from postUnit in bound script
function updateUnitSheet(rows){
  appendRowsToSheet(rows, "UnitData")
}
// called from postTech in bound script
function updateTechSheet(rows){
  appendRowsToSheet(rows, "TechData")
}

function appendRowsToSheet(rows, sheetname){
  var sheet = getOrCreateSheet(sheetname)
  for(var i=0; i < rows.length; ++i){
    sheet.appendRow(rows[i])
  }
}

/** Takes a DataRange containing the full base unit statistics
*/
function calculateAirUnits(){
  // For now, assume there is a named range for base unit stats
  var baseUnitDataRange = SpreadsheetApp.getActiveSpreadsheet()
    .getRangeByName('BaseUnitStats')
  // note: air defense is bugged and doesn't work!
  var relevantColumns = ["soft_attack", "hard_attack", "air_attack",
    "strategic_attack", "range", "air_detection",
    "default_organisation", "default_morale",
    "build_cost_ic", "build_time", "supply_consumption", "fuel_consumption"
  ]
  var columnIndices = [] // corresponds to relevantColumns
  var relevantUnits = ["interceptor", "multi_role", "cas", "cag",
    "tactical_bomber", "naval_bomber", "strategic_bomber", "transport_plane",
    "rocket_interceptor", "flying_bomb", "flying_rocket"
  ]
  //var baseRange = baseUnitDataRange.getRange()
  var arr = baseUnitDataRange.getValues()
  // row major order
  var airUnits = [["unit_name"].concat(relevantColumns)]

  columnIndices = findColumnIndices(arr, relevantColumns)
  Logger.log("columnIndices: %s", JSON.stringify(columnIndices))

  // Iterate over each unit, creating a row for each
  for(var i=0; i < relevantUnits.length; ++i){
    var unit = relevantUnits[i]
    var row = [unit]
    var sourceRow = findRow(arr, unit)
    Logger.log("sourceRow: %s", JSON.stringify(sourceRow))

    // add unit information to row array, then append to table
    for(var j=0; j < columnIndices.length; ++j){
      var value = sourceRow[columnIndices[j]]
      if(value == "") value = 0
      row.push(value)
    }
    airUnits.push(row)
  }
  Logger.log("airUnits: %s", JSON.stringify(airUnits))
  Logger.log("creating air units sheet")
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // delete if it exists
  var sheet = deleteAndCreate(ss, "Air")
  for(var i=0; i < airUnits.length; ++i){
    sheet.appendRow(airUnits[i])
  }
}

/// Helper Functions
/** takes an array Table in row major order, and an array of column names.
Table must have the first row as header containing column names.
Returns an array of indices that correspond to the column names.
*/
function findColumnIndices(table, column_names){
  var header = table[0]
  var indices = []
  for(var i=0; i < column_names.length; ++i){
    indices.push(table[0].indexOf(column_names[i]))
  }
  return indices
}
/** takes an array *table*, and a string *row_name*.
table must be in row-major order and the first column of each row be the name.
Returns the row which begins with row_name, or null if not found.
*/
function findRow(table, row_name){
  for(var i=0; i < table.length; ++i){
    if(table[i][0] == row_name){
      return table[i]
    }
  }
  return null
}
function deleteAndCreate(sheet_name){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // delete if it exists
  var sheet = spreadsheet.getSheetByName(sheet_name)
  if(sheet){
    spreadsheet.deleteSheet(sheet)
  }
  sheet = spreadsheet.insertSheet(sheet_name)
  return sheet
}
function getOrCreateSheet(sheet_name){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheet_name)
  if(sheet === null){
    sheet = spreadsheet.insertSheet(sheet_name)
  }
  return sheet
}
