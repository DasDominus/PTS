function onOpen() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var initiativeSheet = spreadSheet.getSheetByName('Initiative To Sort');

  var initiativeToSort = initiativeSheet.getDataRange().getValues();

  if (initiativeToSort.length > 1) {
    initiativeSheet.showSheet();
  } else {
    initiativeSheet.hideSheet();
  }
}

function HandleEdit(e) {
  var editedSheetName = e.source.getSheetName();
  Logger.log('Touched ' + editedSheetName);

  if (editedSheetName == 'Dashboard') {
    return;
  }

  if (editedSheetName == InitiativeSheet) {
    HandleInitiativeEdit(e);
  }

  if (editedSheetName == 'Initiative Steps') {
    HandleStepEdit(e);
  }

  if (editedSheetName == 'Steps Completed') {
    setSheetToClip();
  }

  sortInitiativeByMultipleColumns();
}

function setSheetToClip() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName('Steps Completed');
  
  // Get the entire data range of the sheet
  var range = sheet.getDataRange();
  
  // Set the text wrap to clip for the entire range
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
}

function SortInitiatives() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var dataRange = ss.getRange("Initiative In Progress!A3:W100");
  
  dataRange.sort([
    {column: 1, ascending: true},
    {column: 2, ascending: true},
  ]);
}
