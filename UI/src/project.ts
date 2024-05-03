import {
  Task,
  getAllTaskForProject,
  getTaskByID,
  createTask,
  updateTask,
  deleteTask,
} from "./apisService/task-service";

import "/src/tailwind.css";

console.log("getAllTaskForProject:", getAllTaskForProject);
console.log("getTaskByID:", getTaskByID);
console.log("createTask:", createTask);
console.log("updateTask:", updateTask);
console.log("deleteTask:", deleteTask);

const projectId = "PRJ0002";
const taskId = "TSK0011";

getAllTaskForProject(projectId)
  .then((response) => {
    console.log("getAllTaskForProject response:", response);
  })
  .catch((error) => {
    console.error("Error fetching tasks:", error);
  });

getTaskByID(projectId, taskId)
  .then((response) => {
    console.log("getTaskByID response:", response);
  })
  .catch((error) => {
    console.error("Error fetching task:", error);
  });

const newTask: Task = {
  id: "TSK0012",
  project_id: projectId,
  name: "New Task",
  description: "This is a new task",
  expected_begin: new Date(),
  expected_finish: new Date(),
  status: "new",
  priority_level: 1,
  created_at: new Date(),
};

createTask(projectId, newTask)
  .then((response) => {
    console.log("createTask response:", response);
  })
  .catch((error) => {
    console.error("Error creating task:", error);
  });

const updatedTask: Task = {
  ...newTask,
  name: "Updated Task",
};

updateTask(projectId, updatedTask, newTask.id)
  .then((response) => {
    console.log("updateTask response:", response);
  })
  .catch((error) => {
    console.error("Error updating task:", error);
  });

deleteTask(projectId, newTask.id)
  .then((response) => {
    console.log("deleteTask response:", response);
  })
  .catch((error) => {
    console.error("Error deleting task:", error);
  });
