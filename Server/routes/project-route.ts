import { Router } from "express";
import {
	createProject,
	deleteProjectByID,
	findAllProject,
	findProjectByID,
	updateProject,
} from "../controllers/project-controller";
import { taskRoute } from "./task-route";

export const projectRoute = Router();

const projectRouteWithId = Router({ mergeParams: true });

projectRouteWithId.get("/", findProjectByID);
projectRouteWithId.patch("/", updateProject);
projectRouteWithId.delete("/", deleteProjectByID);

projectRouteWithId.use("/task", taskRoute);

projectRoute.get("/all", findAllProject);
projectRoute.post("/new", createProject);

projectRoute.use("/:project_id", projectRouteWithId);
