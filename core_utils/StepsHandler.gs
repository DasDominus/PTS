var DandapaniIndexLength = 5;
var dialogResponse = [];
var DandapaniStartingIndex = 11;
var MyTasksId = 'MDE4MjQ2OTI3MTE5MjYxNjM3NTg6MDow';

function HandleStepEdit(e) {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var stepsSheet = spreadSheet.getSheetByName('Initiative Steps');
  var initiativeSheet = spreadSheet.getSheetByName('Initiative In Progress');
  var stepsCompletedSheet = spreadSheet.getSheetByName('Steps Completed');
  var modifiedRow = e.range.getRow();
  var modifiedColumn = e.range.getColumn();

  // Get Edited row and 20 rows below.
  var editedRowRangePost = GetRowRange(stepsSheet, modifiedRow, 20);
  var editedRowRangePostValues = editedRowRangePost.getValues();

  // Get Local stepsCompletedSheet
  var completedSteps = stepsCompletedSheet.getDataRange().getValues();
  Logger.log("modified: " + modifiedColumn);
  var editedRowData = editedRowRangePostValues[0];

  // Only update if touched column is status.
  if (modifiedColumn == 1) {
    // Calculate Values for Initiaitve Update
    var initiativeValues = GetInitiativeUpdateValues(
      stepsSheet, modifiedRow, editedRowRangePostValues, editedRowData, stepsCompletedSheet, completedSteps);
    // Remove step to match initiative
    initiativeValues.splice(4, 1);
    // Remove Domain and Priority to match initiative
    initiativeValues.splice(19, 1);
    initiativeValues.splice(18, 1);
    Logger.log(initiativeValues);

    // Update Initiative
    UpdateInitiative(initiativeSheet, initiativeValues);
  }
}

function UpdateInitiative(sheet, initiativeValues) {
  // Scan the data
  var initiativeData = sheet.getDataRange().getValues();

  for (var rowId = 0; rowId < initiativeData.length; rowId++) {
    if (initiativeData[rowId][1] == initiativeValues[1] && initiativeData[rowId][2] == initiativeValues[2]) {
      var destRange = GetRowRange(sheet, rowId + 1);
      Logger.log("Updating: " + destRange.length + " Values: " + initiativeValues.length + " : " + initiativeValues);
      destRange.setValues([initiativeValues]);
      return;
    }
  }
}

function GetInitiativeUpdateValues(stepSheet, modifiedRow, postRangeValues, editedRowData, stepsCompletedSheet, localSteps) {
  Logger.log("The last modified row is: " + modifiedRow);
  var editedRowRange = GetRowRange(stepSheet, modifiedRow);
  var initiativeValues = editedRowData.slice();
  Logger.log('status' + editedRowData[0]);

  // Get Steps
  var currentStep = parseInt(editedRowData[3]);
  var completedSteps = currentStep;

  // Check forward
  var remainingSteps = 0;
  for (var i = 1; i < postRangeValues.length; i++) {
    row = postRangeValues[i];
    if (editedRowData[1] == row[1] && editedRowData[2] == row[2] && editedRowData[3] != row[3]) {
      remainingSteps += 1;
    } else {
      break;
    }
  }
  var totalSteps = remainingSteps + currentStep;

  if (editedRowData[0] == 'Accomplished') {
    // Set values
    for (var i = 0; i < 5; i++) {
      editedRowData[DandapaniStartingIndex+i] = -1;
    }

    // Get grading
    if (editedRowData[16] == null) {
      editedRowData[16] = AddStepCost();
    }

    // Get grading
    if (editedRowData[18] == null) {
      editedRowData[18] = GradeStep();
    }

    // Set start date;
    if (editedRowData[7] == null || editedRowData[7] == '') {
      editedRowData[7] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy");
    }
    // Set end date;
    if (editedRowData[8] == null || editedRowData[8] == '') {
      editedRowData[8] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy");
    }
    // Set week num
    editedRowData[5] = getISOWeekNumber(editedRowData[8]);
    editedRowRange.setValues([editedRowData]);

    if (remainingSteps == 0) {
      // Set endtime for initiative
      initiativeValues[7] = editedRowData[8];
      // Calculate total dandapani index and energy if is last step.
      var aggregatedIndex = CalculateIndexAndEnergy(localSteps, editedRowData, totalSteps);
      Logger.log(totalSteps);
      for (var i = 0; i < aggregatedIndex.length; i++) {
        initiativeValues[DandapaniStartingIndex + i] = aggregatedIndex[i];
      }
      initiativeValues[17] = CalculateCompletionRating(localSteps, editedRowData);
    } else {
      initiativeValues[0] = "In Progress";
      // Check if next row is the same initiative and put it to in progress
      var nextRowRange = GetRowRange(stepSheet, modifiedRow + 1);
      var nextRowValues = nextRowRange.getValues()[0];
      if (nextRowValues[1] == editedRowData[1] && nextRowValues[2] == editedRowData[2]) {
        nextRowValues[0] = "In Progress";
      }
      Logger.log('next: ' + nextRowValues);
      nextRowRange.setValues([nextRowValues]);
    }


    // Move Row to stepsCompletedSheet
    stepsCompletedSheet.appendRow(editedRowData);
    stepSheet.deleteRow(modifiedRow);
  } else {
    completedSteps -= 1;
  }
  // Set step progress
  initiativeValues[3] = `${completedSteps}[${totalSteps}]`;

  Logger.log(initiativeValues);
  return initiativeValues;
}

function CalculateCompletionRating(localSteps, editedRowData) {
  var avgRating = 0;
  var total = 0;
  localSteps.push(editedRowData);
  localSteps.forEach((step, index) => {
    if (step[1] == editedRowData[1] && step[2] == editedRowData[2]) {
      avgRating += step[17];
      total += 1;
    }
  });
  return avgRating / total;
}

function CalculateIndexAndEnergy(localSteps, editedRowData, totalSteps) {
  var aggregatedIndex = new Array(0, 0, 0, 0, 0, 0, 0);
  var totalValidStepsPerIndex = new Array(0, 0, 0, 0, 0);
  localSteps.push(editedRowData);
  localSteps.forEach((step, index) => {
    if (step[1] == editedRowData[1] && step[2] == editedRowData[2]) {
      Logger.log(`Step {${index}} {${step.length}}`);
      for (var i = 0; i < DandapaniIndexLength; i++) {
        if (step[DandapaniStartingIndex + i] >= 0) {
          aggregatedIndex[i] += parseFloat(step[DandapaniStartingIndex + i]);
          totalValidStepsPerIndex[i] += 1;
        }
      }
      aggregatedIndex[5] += parseFloat(step[DandapaniStartingIndex + 5]);
      aggregatedIndex[6] += parseFloat(step[DandapaniStartingIndex + 6]);
      Logger.log(`AIndex ${aggregatedIndex[5]} Step ${step[DandapaniStartingIndex + 5]}`);
    }
  });
  Logger.log(aggregatedIndex);
  for (var i = 0; i < DandapaniIndexLength; i++) {
    aggregatedIndex[i] = aggregatedIndex[i] / totalValidStepsPerIndex[i];
  }
  return aggregatedIndex;
}

function AddStepCost() {
  var ui = SpreadsheetApp.getUi(); // Same variations.

  var result = ui.prompt(
    'Enter the amount of energy used',
    ui.ButtonSet.OK_CANCEL);
  return Number(result.getResponseText());
}

function GradeStep() {
  var ui = SpreadsheetApp.getUi(); // Same variations.

  var result = ui.prompt(
    'Grade the quality of the step form 1-10',
    ui.ButtonSet.OK_CANCEL);
  return Number(result.getResponseText());
}
