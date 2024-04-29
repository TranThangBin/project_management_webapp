import { type Handler, type Request } from "express";
import type { ResponsePayload } from "./response";
import { ProjectModel } from "../models/project-model";

export const findAllProject: Handler = (_, res) => {
	ProjectModel.find({})
		.then((projects) => {
			const payload: ResponsePayload = {
				status: "ok",
				message: "successfully find all projects",
				data: projects,
			};

			res.json(payload);
		})
		.catch((err) => {
			const message =
				"an internal error has occurred when finding all projects";

			console.error(message, err);

			const payload: ResponsePayload = {
				status: "fail",
				message: message,
				data: null,
			};

			res.status(500).json(payload);
		});
};

export const findProjectByID: Handler = (
	req: Request<{ id?: string }>,
	res,
) => {
	const id = req.params.id;

	if (id === undefined) {
		const payload: ResponsePayload = {
			status: "fail",
			message: "missing request param id",
			data: null,
		};

		return res.status(400).json(payload);
	}

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
		.catch((err) => {
			const message = `an internal error has occurred when finding project with id ${id}`;

			console.error(message, err);

			const payload: ResponsePayload = {
				status: "fail",
				message,
				data: null,
			};

			res.status(500).json(payload);
		});
};

export const createProject: Handler = (req, res) => {
	ProjectModel.create(req.body)
		.then((project) => {
			const payload: ResponsePayload = {
				status: "ok",
				message: "successfully create project",
				data: project,
			};

			res.status(201).json(payload);
		})
		.catch((err) => {
			const message = "an internal error has occurred when creating a project";

			console.error(message, err);

			const payload: ResponsePayload = {
				status: "fail",
				message,
				data: null,
			};

			res.status(500).json(payload);
		});
};

export const updateProject: Handler = (req: Request<{ id?: string }>, res) => {
	const id = req.params.id;

	if (id === undefined) {
		const payload: ResponsePayload = {
			status: "fail",
			message: "missing request param id",
			data: null,
		};

		return res.status(400).json(payload);
	}

	ProjectModel.findOneAndUpdate({ id }, { $set: req.body }).then((project) => {
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
	});
};

export const deleteProjectByID: Handler = (
	req: Request<{ id?: string }>,
	res,
) => {
	const id = req.params.id;

	if (id === undefined) {
		const payload: ResponsePayload = {
			status: "fail",
			message: "missing request param id",
			data: null,
		};

		return res.status(400).json(payload);
	}

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
		.catch((err) => {
			const message = `an internal error has occurred when deleting project with id ${id}`;

			console.error(message, err);

			const payload: ResponsePayload = {
				status: "fail",
				message: message,
				data: null,
			};

			res.status(500).json(payload);
		});
};
