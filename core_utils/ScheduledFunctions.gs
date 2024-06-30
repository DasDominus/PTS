function RefreshSteps() {
  var ss = SpreadsheetApp.openById(Utils.PROD_SHEET_ID);
  var msokrMapping = createDictionary('2024', 3, [0, 7]);

  // Get the 'Initiative Steps' sheet
  var stepsSheet = ss.getSheetByName('Initiative Steps');

  // Get the range and values for column B, the key column
  var lastRow = stepsSheet.getLastRow();
  var keyColumnRange = stepsSheet.getRange('B2:B' + lastRow);
  var keyColumnValues = keyColumnRange.getValues();

  // Initialize an array to hold the values for columns T and U
  // var updateValues = new Array(lastRow).fill([null, null]);
  var updateValues = new Array(lastRow).fill([null]);

  // Populate the updateValues array with values from the msokrMapping
  for (var i = 0; i < keyColumnValues.length; i++) {
    var key = keyColumnValues[i][0]; // Extract the key from column B
    Logger.log(key);
    if (msokrMapping.hasOwnProperty(key)) {
      // If the key is found in the mapping, prepare the value pair
      var valuePair = msokrMapping[key];
      // Update the corresponding row in the updateValues array
      updateValues[i] = [valuePair[0]];
      // updateValues[i] = valuePair;
    }
  }

  // Get the range for columns T and U for the entire sheet
  // getRange(row, column, numRows, numColumns)
  var updateRange = stepsSheet.getRange(2, 20, updateValues.length, 1); // Column T is 20th, U is 21st
  // Update the sheet with all values at once
  updateRange.setValues(updateValues);
}

function RefreshMSOKR() {
  var ss = SpreadsheetApp.openById(Utils.PROD_SHEET_ID);
  var msoSheet = ss.getSheetByName('MSO');
  var okrSheet = ss.getSheetByName('2024');
  var objColumn = msoSheet.getRange('D2:D').getValues().flat();
  var okrData = okrSheet.getRange('B2:I').getValues();
  
  var countDict = {};
  objColumn.forEach(obj => {
    var done = okrData.reduce((count, row) => count + (row[0] === obj && row[5] === "Accomplished" ? 1 : 0), 0);
    var total = okrData.reduce((count, row) => count + (row[0] === obj ? 1 : 0), 0);
    countDict[obj] = String(done) + '/' + String(total);
  });

  var results = objColumn.map(obj => [countDict[obj]]);

  msoSheet.getRange(2, 5, results.length, 1).setValues(results); // Sets results in column C of Sheet B
}

function moveCompletedToSheet() {
  // Access the source spreadsheet and sheets
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var inprogressSheet = ss.getSheetByName('Initiative In Progress');
  var completedSheet = ss.getSheetByName('Initiatives Completed');
  var columns = '(Status, Milestone, Initiative, StepCount, Week, TargetDate, StartDate, EndDate, Activities, Artifacts, Willpower, Concentration, Awareness, SocialAwareness, Communication)';
  
  var inprogRange = inprogressSheet.getDataRange();
  var inprogressData = inprogRange.getValues();
  var inprogressNotes = inprogRange.getNotes();
  var initiativeToMove = [];
  var notesToMove = [];
  
  for (var i = 0; i < inprogressData.length ; i++) {
    var row = inprogressData[i];
    if (!row) {
      continue;
    }

    // Check status
    if (row[0] == 'Accomplished') {
      Logger.log(row);
      // Check if EndTime is set, if not, set to the day the script is run.
      Logger.log(row[7]);
      if (!row[7]) {
        row[7] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy");
        // Set week num
        row[4] = getISOWeekNumber(new Date());
      }
      initiativeToMove.push(row);

      // Copy Notes Over
      var note = inprogressNotes[i][3].toString().replace(",", "");
      Logger.log(typeof note);
      notesToMove.push([note]);
    }
  }

  if (initiativeToMove.length > 0) {
    // Copy Values Over
    completedSheet.insertRows(2, initiativeToMove.length);
    var targetRange = completedSheet.getRange(2, 1, initiativeToMove.length, initiativeToMove[0].length);
    targetRange.setValues(initiativeToMove);
    
    var notesRange = completedSheet.getRange(2, 4, notesToMove.length);
    Logger.log(notesToMove.length);
    notesRange.setNotes(notesToMove);

    inprogressSheet.deleteRows(2, initiativeToMove.length);
  }
}