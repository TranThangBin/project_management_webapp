import { ResponsePayload } from "./response-payload";

export type Project = {
	id: string;
	name: string;
	description?: string;
	status: "new" | "on going" | "finish";
	estimated_finish?: Date;
	team_size: number;
	created_at: Date;
};

export async function getAllProject() {
	const res = await fetch("http://localhost:3000/project/all");

	const data = await res.json();

	return data as ResponsePayload<Project[] | null>;
}

export async function createProject(project: Project) {
	const res = await fetch("http://localhost:3000/project/new", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(project),
	});

	const data = await res.json();

	return data as ResponsePayload<Project | null>;
}

export async function deleteProject(id: string) {
	const res = await fetch(`http://localhost:3000/project/${id}`, {
		method: "DELETE",
	});

	const data = await res.json();

	return data as ResponsePayload<Project | null>;
}

export async function updateProject(id: string, project: Project) {
	const res = await fetch(`http://localhost:3000/project/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(project),
	});

	const data = await res.json();

	return data as ResponsePayload<Project | null>;
}
