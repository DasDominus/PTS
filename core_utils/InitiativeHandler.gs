var InitiativeSheet = "Initiative In Progress";

function sortInitiativeByMultipleColumns() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var initiativeSheet = spreadSheet.getSheetByName('Initiative In Progress');

  // Assume data starts from the first row and goes till the 100th row. Adjust as necessary.
  var range = initiativeSheet.getRange("A2:P300");

  // Sort by Column A (ascending) and then by Column B (ascending)
  range.sort([
    { column: 1, ascending: true },
    { column: 2, ascending: true },
    { column: 3, ascending: true }
  ]);
}

function HandleInitiativeEdit(e) {

  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var stepsSheet = spreadSheet.getSheetByName('Initiative Steps');

  var ss = e.source;
  var modifiedRow = e.range.getRow();
  var modifiedColumn = e.range.getColumn();
  // Only update if touched column is status.
  if (modifiedColumn != 1) {
    Logger.log('Skipping step update on col' + modifiedColumn)
    return;
  }

  Logger.log("The last modified row is: " + modifiedRow + " in " + InitiativeSheet);
  var editedRow = GetRowRange(ss.getActiveSheet(), modifiedRow);
  var editedRowData = editedRow.getValues();
  var editedRowNotes = editedRow.getNotes();
  // TODO: Support Smart Chips
  // var editedLinks = editedRow.getRichTextValues();
  // Logger.log(editedLinks);

  // Log the edited row data
  Logger.log(editedRowData);
  var initiativeEntry = editedRowData[0];
  var initiativeNote = editedRowNotes[0][3];
  Logger.log(initiativeNote);

  // Check if Initiative is in Progress
  if (initiativeEntry[0] == 'In Progress') {
    // Check if steps are already populated
    if (!checkMatchingRecord(initiativeEntry[1], initiativeEntry[2], stepsSheet)) {
      Logger.log('Instantiating Steps.');
      var steps = initiativeNote.split('\n');
      // Set steps to unstarted initially
      initiativeEntry[0] = 'Unstarted';
      stepsSheet.insertRows(2, steps.length);
      var targetRange = stepsSheet.getRange(2, 1, steps.length, initiativeEntry.length + 1);

      var stepEntries = [];

      for (var i = 0; i < steps.length; i++) {
        var stepEntry = initiativeEntry.slice();
        // Prepare new row
        Logger.log(steps[i]);
        // Set Step Data
        var stepParams = steps[i].split('.');
        stepEntry.splice(3, 0, stepParams[0]);
        stepEntry[4] = stepParams[1];

        // Set First Entry's status to In Progress
        if (i == 0) {
          stepEntry[0] = 'In Progress';
        }

        // Copy to step entry
        Logger.log(stepEntry.length);
        stepEntries.push(stepEntry);
      }

      targetRange.setValues(stepEntries);
    } else {
      Logger.log('Skipping step generation.')
    }
  }
}