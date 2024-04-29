export type ResponsePayload<T> = {
	status: "ok" | "fail";
	message: string;
	data: T;
};
