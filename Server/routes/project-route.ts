import { Router } from "express";
import {
	createProject,
	deleteProjectByID,
	findAllProject,
	findProjectByID,
	updateProject,
} from "../controllers/project-controller";

export const projectRoute = Router();

projectRoute.get("/all", findAllProject);
projectRoute.get("/:id", findProjectByID);
projectRoute.post("/new", createProject);
projectRoute.patch("/:id", updateProject);
projectRoute.delete("/:id", deleteProjectByID);
