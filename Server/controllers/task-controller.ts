import { type Handler, type Request, type Response } from "express";
import type { ResponsePayload } from "./response";
import { ProjectModel } from "../models/project-model";
import { TaskModel } from "../models/task-model";

export const findAllTasksForProject: Handler = (
    req: Request<{ Project_Id?: string }>,
    res: Response
) => {
    const projectId = req.params.Project_Id;

    if (!projectId) {
        const payload: ResponsePayload = {
            status: "fail",
            message: "Missing project ID in the request",
            data: null,
        };
        return res.status(400).json(payload);
    }

    ProjectModel.findById(projectId)
        .then((project) => {
            if (!project) {
                const payload: ResponsePayload = {
                    status: "fail",
                    message: "Project not found",
                    data: null,
                };
                return res.status(404).json(payload);
            }

            TaskModel.find({ projectId })
                .then((tasks) => {
                    const payload: ResponsePayload = {
                        status: "ok",
                        message:
                            "List of tasks for the project retrieved successfully",
                        data: tasks,
                    };
                    res.json(payload);
                })
                .catch((err) => {
                    console.error("Error retrieving tasks for project: ", err);
                    const payload: ResponsePayload = {
                        status: "fail",
                        message:
                            "An internal error occurred when retrieving tasks for the project",
                        data: null,
                    };
                    res.status(500).json(payload);
                });
        })
        .catch((err) => {
            console.error("Error finding project: ", err);
            const payload: ResponsePayload = {
                status: "fail",
                message: "An internal error occurred when finding project",
                data: null,
            };
            res.status(500).json(payload);
        });
};

export const createTask: Handler = (req, res) => {
    TaskModel.create(req.body)
        .then((task) => {
            const payload: ResponsePayload = {
                status: "ok",
                message: "Successfully create task",
                data: task,
            };

            res.status(201).json(payload);
        })
        .catch((err) => {
            const message =
                "an internal error has occurred when creating a task";

            console.error(message, err);

            const payload: ResponsePayload = {
                status: "fail",
                message,
                data: null,
            };

            res.status(500).json(payload);
        });
};

export const updateTask: Handler = (req: Request<{ id?: string }>, res) => {
    const id = req.params.id;

    if (id === undefined) {
        const payload: ResponsePayload = {
            status: "fail",
            message: "missing request param id",
            data: null,
        };

        return res.status(400).json(payload);
    }
    TaskModel.findOneAndUpdate({ id }, { $set: req.body }).then((task) => {
        if (task === null) {
            const payload: ResponsePayload = {
                status: "fail",
                message: `there are no task with id ${id}`,
                data: null,
            };

            return res.status(404).json(payload);
        }

        const payload: ResponsePayload = {
            status: "ok",
            message: `successfully update task with id ${id}`,
            data: task,
        };

        res.json(payload);
    });
};

export const deleteTaskByID: Handler = (req: Request<{ id?: string }>, res) => {
    const id = req.params.id;

    if (id === undefined) {
        const payload: ResponsePayload = {
            status: "fail",
            message: "missing request param id",
            data: null,
        };

        return res.status(400).json(payload);
    }

    TaskModel.findOneAndDelete({ id })
        .then((task) => {
            if (task === null) {
                const payload: ResponsePayload = {
                    status: "fail",
                    message: `there are no task with id ${id}`,
                    data: null,
                };

                return res.status(404).json(payload);
            }

            const payload: ResponsePayload = {
                status: "ok",
                message: `successfully delete task with id ${id}`,
                data: task,
            };

            res.json(payload);
        })
        .catch((err) => {
            const message = `an internal error has occurred when deleting task with id ${id}`;

            console.error(message, err);

            const payload: ResponsePayload = {
                status: "fail",
                message: message,
                data: null,
            };

            res.status(500).json(payload);
        });
};
