import { type ErrorRequestHandler } from "express";
import type { ResponsePayload } from "./response";

export const errorHandler: ErrorRequestHandler = (err, req, res, _) => {
	if (err.name === "ValidationError") {
		const payload: ResponsePayload = {
			status: "fail",
			message: err.message,
			data: null,
		};

		return res.status(400).json(payload);
	}

	const message = `an internal error has occurred when handling ${req.method} ${req.path}`;

	console.error(message);
	console.error(err);

	const payload: ResponsePayload = {
		status: "fail",
		message,
		data: null,
	};

	res.status(500).json(payload);
};
