import { type Handler, type Request } from "express";
import type { ResponsePayload } from "./response";
import { ProjectModel } from "../models/project-model";

export const findAllProject: Handler = (_, res, next) => {
	ProjectModel.aggregate()
		.addFields({
			estimated_finish_empty: {
				$or: [
					{ $eq: ["$estimated_finish", null] },
					{ $eq: [{ $type: "$estimated_finish" }, "missing"] },
				],
			},
		})
		.sort({ status: -1, estimated_finish_empty: 1, estimated_finish: 1 })
		.then((projects) => {
			const payload: ResponsePayload = {
				status: "ok",
				message: "successfully find all projects",
				data: projects,
			};

			res.json(payload);
		})
		.catch(next);
};

export const findProjectByID: Handler = (
	req: Request<{ project_id?: string }>,
	res,
	next,
) => {
	const id = req.params.project_id;

	ProjectModel.findOne({ id })
		.then((project) => {
			if (project === null) {
				const payload: ResponsePayload = {
					status: "fail",
					message: `unable find project with id ${id}`,
					data: null,
				};

				return res.status(404).json(payload);
			}

			const payload: ResponsePayload = {
				status: "ok",
				message: `successfully find project with id ${id}`,
				data: project,
			};

			res.json(payload);
		})
		.catch(next);
};

export const createProject: Handler = (req, res, next) => {
	ProjectModel.create(req.body)
		.then((project) => {
			const payload: ResponsePayload = {
				status: "ok",
				message: "successfully create project",
				data: project,
			};

			res.status(201).json(payload);
		})
		.catch(next);
};

export const updateProject: Handler = (
	req: Request<{ project_id?: string }>,
	res,
	next,
) => {
	const id = req.params.project_id;

	ProjectModel.findOneAndUpdate(
		{ id },
		{ $set: req.body },
		{ runValidators: true, new: true },
	)
		.then((project) => {
			if (project === null) {
				const payload: ResponsePayload = {
					status: "fail",
					message: `there are no project with id ${id}`,
					data: null,
				};

				return res.status(404).json(payload);
			}

			const payload: ResponsePayload = {
				status: "ok",
				message: `successfully update project with id ${id}`,
				data: project,
			};

			res.json(payload);
		})
		.catch(next);
};

export const deleteProjectByID: Handler = (
	req: Request<{ project_id?: string }>,
	res,
	next,
) => {
	const id = req.params.project_id;

	ProjectModel.findOneAndDelete({ id })
		.then((project) => {
			if (project === null) {
				const payload: ResponsePayload = {
					status: "fail",
					message: `there are no project with id ${id}`,
					data: null,
				};

				return res.status(404).json(payload);
			}

			const payload: ResponsePayload = {
				status: "ok",
				message: `successfully delete project with id ${id}`,
				data: project,
			};

			res.json(payload);
		})
		.catch(next);
};
