function UpdateProgress() {
  DriveApp.getRootFolder();
  var query = `SELECT * FROM ${Utils.DATASET_ID_PROD}.${Utils.INIT_COMPLETED_TABLE_ID} WHERE Status is not NULL`;
  completed = Utils.GetBigqueryRows(query, Utils.PROJECT_ID);

  var query = `SELECT * FROM ${Utils.DATASET_ID_PROD}.${Utils.INIT_INPROG_TABLE_ID} WHERE Status is not NULL`;
  inprog = Utils.GetBigqueryRows(query, Utils.PROJECT_ID);


}