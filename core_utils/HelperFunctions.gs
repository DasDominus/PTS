/**
 * Creates a dictionary from specified key and value columns.
 *
 * @param {string} sheetName - The name of the sheet to get values from.
 * @param {string} keyColumn - The column letter to use as keys.
 * @param {Array<string>} valColumns - An array of column letters to use as values.
 * @return {Object} The created dictionary.
 */
function createDictionary(sheetName, keyColumnIndex, valColumnIndexes) {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var milestoneSheet = spreadSheet.getSheetByName(sheetName);
  var milestones = milestoneSheet.getRange("A2:J" + milestoneSheet.getLastRow()).getValues();

  var dictionary = {};
  milestones.forEach(function (row) {
    var key = row[keyColumnIndex];
    var value = valColumnIndexes.map(function (index) { return row[index]; });
    dictionary[key] = value;
  });

  return dictionary;
}

function GetRowRange(sheet, rowId, additionalRows) {
  if (additionalRows == null) {
    additionalRows = 0;
  }
  var editedRow = sheet.getRange(rowId, 1, 1+additionalRows, sheet.getLastColumn());
  return editedRow;
}

function checkMatchingRecord(milestone, initiative, sheetToCheck) {
  // Get the data ranges
  var stepsData = sheetToCheck.getDataRange().getValues();
    
  var isPresentInSteps = stepsData.some(function(row) {
    return row[1] == milestone && row[2] == initiative; // [B,C] of S2
  });
    
  return isPresentInSteps;
}

function ensureNumeric(value, decimalPlaces) {
  if (typeof value !== 'number') {
    value = Number(value);
  }
  
  return parseFloat(value.toFixed(decimalPlaces));
}

function getISOWeekNumber(date) {
  if (typeof date != Date) {
    date = new Date(date);
  }
  date = new Date(date.getTime());
  date.setHours(0, 0, 0, 0);
  
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}