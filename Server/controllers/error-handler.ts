import { type ErrorRequestHandler } from "express";
import type { ResponsePayload } from "./response";

export const errorHandler: ErrorRequestHandler = (err, _, res, __) => {
	if (err.name === "ValidationError") {
		const payload: ResponsePayload = {
			status: "fail",
			message: err.message,
			data: null,
		};

		return res.status(400).json(payload);
	}

	const message = "an internal error has occurred when handling request";

	console.error(message, err);

	const payload: ResponsePayload = {
		status: "fail",
		message,
		data: null,
	};

	res.status(500).json(payload);
};
