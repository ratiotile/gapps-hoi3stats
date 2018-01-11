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
      row.push(sourceRow[columnIndices[j]])
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
function deleteAndCreate(spreadsheet, sheet_name){
  // delete if it exists
  var sheet = spreadsheet.getSheetByName(sheet_name)
  if(sheet){
    spreadsheet.deleteSheet(sheet)
  }
  sheet = spreadsheet.insertSheet(sheet_name)
  return sheet
}
