import { Router } from "express";

import {
	findAllTask,
	createTask,
	updateTask,
	deleteTaskByID,
	findTaskById,
} from "../controllers/task-controller";

export const taskRoute = Router({ mergeParams: true });

taskRoute.get("/all", findAllTask);
taskRoute.get("/:task_id", findTaskById);
taskRoute.post("/new", createTask);
taskRoute.patch("/:task_id", updateTask);
taskRoute.delete("/:task_id", deleteTaskByID);
