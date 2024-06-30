function listTasks(taskListId) {
  try {
    // List the task items of specified tasklist using taskList id.
    const tasks = Tasks.Tasks.list(taskListId, {maxResults: 100, showCompleted: false});
    // If tasks are available then print all task of given tasklists.
    if (!tasks.items) {
      console.log('No tasks found.');
      return;
    }
    return tasks;
  } catch (err) {
    // TODO (developer) - Handle exception from Task API
    console.log('Failed with an error %s', err.message);
  }
}

function getTaskEntry(taskListId, title) {
  var tasks = listTasks(taskListId);
  // Print the task title and task id of specified tasklist.
  Logger.log("Total tasks found: " + tasks.items.length);
  for (let i = 0; i < tasks.items.length; i++) {
    const task = tasks.items[i];
    console.log('Task with title "%s" and ID "%s" was found.', task.title, task.id);
    if (task.title == title) {
      return task;
    }
  }
  return '';
}

function addTask(taskListId, title, notes, due) {
  // Task details with title and notes for inserting new task
  let task = {
    title: title,
    notes: notes,
    due: due
  };
  try {
    // Call insert method with taskDetails and taskListId to insert Task to specified tasklist.
    task = Tasks.Tasks.insert(task, taskListId);
    // Print the Task ID of created task.
    console.log('Task with ID "%s" was created.', task.id);
  } catch (err) {
    // TODO (developer) - Handle exception from Tasks.insert() of Task API
    console.log('Failed with an error %s', err.message);
  }
}

function updateTask(taskListId, taskId, title, notes, due, status) {
  // Task details with title and notes for inserting new task
  let task = {
    id: taskId,
    title: title,
    notes: notes,
    due: due,
    status: status
  };
  try {
    // Call insert method with taskDetails and taskListId to insert Task to specified tasklist.
    task = Tasks.Tasks.update(task, taskListId, taskId);
    // Print the Task ID of created task.
    console.log('Task with ID "%s" was updated.', task.id);
  } catch (err) {
    // TODO (developer) - Handle exception from Tasks.insert() of Task API
    console.log('Failed with an error %s', err.message);
  }
}