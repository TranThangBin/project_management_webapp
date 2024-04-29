import { Router } from "express";

import {
    findAllTasksForProject,
    createTask,
    updateTask,
    deleteTaskByID,
} from "../controllers/task-controller";

export const taskRoute = Router();

taskRoute.get("/all", findAllTasksForProject);
taskRoute.post("/new", createTask);
taskRoute.patch("/:id", updateTask);
taskRoute.delete("/:id", deleteTaskByID);
