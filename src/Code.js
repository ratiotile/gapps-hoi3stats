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
function calculateAirUnits(baseUnitDataRange){
  // note: air defense is bugged and doesn't work!
  var relevantColumns = ["soft_attack", "hard_attack", "air_attack",
    "strategic_attack", "range", "air_detection",
    "default_organisation, default_morale",
    "build_cost_ic", "build_time", "supply_consumption", "fuel_consumption"
  ]
  var columnIndices = [] // corresponds to relevantColumns
  var relevantUnits = ["interceptor", "multi_role", "cas", "cag",
    "tactical_bomber", "naval_bomber", "strategic_bomber", "transport_plane",
    "rocket_interceptor", "flying_bomb", "flying_rocket"
  ]
  var baseRange = baseUnitDataRange.getRange()
  var arr = baseRange.getValues()
  // row major order
  var airUnits = [["unit_name"].concat(relevantColumns)]
  columnIndices = findColumnIndices(arr, relevantColumns)
  // Iterate over each unit, creating a row for each
  for(var i=0; i < relevantUnits.length; ++i){
    var unit = relevantUnits[i]
    var row = [unit]
    var sourceRow = findRow(arr, unit)
    // add unit information to row array, then append to table
    for(var j=0; j < columnIndices.length, ++j){
      row.push(sourceRow[columnIndices[j]])
    }
    airUnits.push(row)
  }
  Logger.log("creating air units sheet")
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.insertSheet("Air")
  for(var i=0; i < airUnits.length; ++i){
    sheet.appendRow(airUnits[i])
  }
}
