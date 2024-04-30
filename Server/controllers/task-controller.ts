import { type Handler, type Request } from "express";
import type { ResponsePayload } from "./response";
import { TaskModel } from "../models/task-model";

export const findAllTask: Handler = (
	req: Request<{ project_id?: string }>,
	res,
	next,
) => {
	const project_id = req.params.project_id;

	TaskModel.find({ project_id })
		.then((tasks) => {
			const payload: ResponsePayload = {
				status: "ok",
				message: `list of tasks for project ${project_id} was retrieved successfully`,
				data: tasks,
			};
			res.json(payload);
		})
		.catch(next);
};

export const findTaskById: Handler = (
	req: Request<{ project_id?: string; task_id?: string }>,
	res,
	next,
) => {
	const { project_id, task_id: id } = req.params;

	TaskModel.findOne({ id, project_id })
		.then((task) => {
			if (task === null) {
				const payload: ResponsePayload = {
					status: "fail",
					message: `there are no task with id ${id} in project ${project_id}`,
					data: null,
				};

				return res.status(404).json(payload);
			}

			const payload: ResponsePayload = {
				status: "ok",
				message: `successfully find task with id ${id}`,
				data: task,
			};

			res.json(payload);
		})
		.catch(next);
};

export const createTask: Handler = (
	req: Request<{ project_id?: string }>,
	res,
	next,
) => {
	const project_id = req.params.project_id;

	TaskModel.create({ project_id, ...req.body })
		.then((task) => {
			const payload: ResponsePayload = {
				status: "ok",
				message: `successfully create task for project ${task.project_id}`,
				data: task,
			};

			res.status(201).json(payload);
		})
		.catch(next);
};

export const updateTask: Handler = (
	req: Request<{ project_id?: string; task_id?: string }>,
	res,
	next,
) => {
	const { project_id, task_id: id } = req.params;

	TaskModel.findOneAndUpdate(
		{ project_id, id },
		{ $set: req.body },
		{ runValidators: true, new: true },
	)
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
				message: `successfully update task with id ${id}`,
				data: task,
			};

			res.json(payload);
		})
		.catch(next);
};

export const deleteTaskByID: Handler = (
	req: Request<{ project_id?: string; task_id?: string }>,
	res,
	next,
) => {
	const { project_id, task_id: id } = req.params;

	TaskModel.findOneAndDelete({ project_id, id })
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
		.catch(next);
};
