import { ResponsePayload } from "./response-payload";

export type Task = {
	id: string;
	project_id: string;
	name: string;
	description?: string;
	expected_begin?: Date;
	expected_finish?: Date;
	status: "new" | "on going" | "finish";
	priority_level: number;
	created_at: Date;
};

export async function getAllTaskForProject(project_id: string) {
	const res = await fetch(
		`http://localhost:3000/project/${project_id}/task/all`,
	);

	const data = await res.json();

	return data as ResponsePayload<Task[] | null>;
}

export async function getTaskByID(project_id: string, id: string) {
	const res = await fetch(
		`http://localhost:3000/project/${project_id}/task/${id}`,
	);

	const data = await res.json();

	return data as ResponsePayload<Task | null>;
}

export async function createTask(project_id: string, task: Task) {
	const res = await fetch(
		`http://localhost:3000/project/${project_id}/task/new`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(task),
		},
	);

	const data = await res.json();

	return data as ResponsePayload<Task | null>;
}

export async function updateTask(project_id: string, task: Task, id: string) {
	const res = await fetch(
		`http://localhost:3000/project/${project_id}/task/${id}`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(task),
		},
	);

	const data = await res.json();

	return data as ResponsePayload<Task | null>;
}

export async function deleteTask(project_id: string, id: string) {
	const res = await fetch(
		`http://localhost:3000/project/${project_id}/task/${id}`,
		{
			method: "DELETE",
		},
	);

	const data = await res.json();

	return data as ResponsePayload<Task | null>;
}
