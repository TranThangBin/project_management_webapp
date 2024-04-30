import {
	Project,
	createNewProject,
	deleteProject,
	getAllProject,
	updateProject,
} from "./apisService/project-service";
import "/src/tailwind.css";

const newProjectDialog = document.querySelector(
	"dialog#create-project",
) as HTMLDialogElement;

const updateProjectDialog = document.querySelector(
	"dialog#update-project",
) as HTMLDialogElement;

const formNewProject = newProjectDialog.querySelector(
	"form#form-create-project",
) as HTMLFormElement;

const formUpdateProject = updateProjectDialog.querySelector(
	"form#form-update-project",
) as HTMLFormElement;

const updateProjectInputs = formUpdateProject.querySelectorAll("input");

const projectList = document.querySelector(
	"ul#project-list",
) as HTMLUListElement;

document.addEventListener("DOMContentLoaded", addAllProjects);

document
	.querySelector("button#btn-open-form")!
	.addEventListener("click", () => newProjectDialog.showModal());

document
	.querySelector("button#btn-close-createform")!
	.addEventListener("click", () => newProjectDialog.close());

document
	.querySelector("button#btn-close-updateform")!
	.addEventListener("click", () => updateProjectDialog.close());

document.querySelector("button#btn-refresh")!.addEventListener("click", () => {
	while (projectList.lastChild) {
		projectList.removeChild(projectList.lastChild);
	}
	addAllProjects();
});

formNewProject.addEventListener("reset", function () {
	this.querySelector("input")!.focus();
});

formNewProject.addEventListener("submit", function (e) {
	e.preventDefault();

	const formData = new FormData(this);

	const project: unknown = Object.fromEntries(formData);

	createNewProject(project as Project)
		.then(({ status, data, message }) => {
			if (status === "ok" && data !== null) {
				addOneProject(data);
				this.reset();
				return newProjectDialog.close();
			}

			alert(message);
		})
		.catch(() => alert("something went wrong"));
});

formUpdateProject.addEventListener("reset", function () {
	this.querySelector("input")!.focus();
});

function addAllProjects() {
	getAllProject()
		.then(({ status, data, message }) => {
			if (status === "ok" && data !== null) {
				const projects = data;

				const projectCount = projects.length;

				for (let i = 0; i < projectCount; i++) {
					addOneProject(projects[i]);
				}

				return;
			}

			alert(message);
		})
		.catch(() => alert("something went wrong"));
}

function addOneProject(project: Project) {
	const listItem = document.createElement("li");
	const toolContainter = document.createElement("div");
	const updateProjectBtn = document.createElement("button");
	const deleteProjectBtn = document.createElement("button");
	const projectLink = new URL("/pages/project.html", document.location.origin);
	const projectNameElem = document.createElement("a");
	const projectDescElem = document.createElement("div");

	projectList.appendChild(listItem);
	toolContainter.append(updateProjectBtn, deleteProjectBtn);
	listItem.append(toolContainter, projectNameElem, projectDescElem);

	listItem.classList.add("rounded-lg", "bg-white", "p-2", "pt-0");

	toolContainter.classList.add("border-b", "flex", "justify-end", "gap-2");

	updateProjectBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
	updateProjectBtn.addEventListener("click", () => {
		updateProjectDialog.showModal();

		formUpdateProject.addEventListener("submit", handleUpdateProject);

		updateProjectDialog.addEventListener("close", handleCloseUpdateDialog);

		const inputCount = updateProjectInputs.length;

		for (let i = 0; i < inputCount; i++) {
			if (
				updateProjectInputs[i].name === "estimated_finish" &&
				project.estimated_finish
			) {
				updateProjectInputs[i].value = project.estimated_finish
					.toString()
					.split("T")[0];
				continue;
			}

			updateProjectInputs[i].value = project[
				updateProjectInputs[i].name as keyof Project
			] as string;
		}
	});

	deleteProjectBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
	deleteProjectBtn.addEventListener("click", () => {
		if (
			confirm(
				"Are you sure you wanted to delete this project! " +
					"All tasks belong to the project will be delete too! " +
					"Make sure you have the back up of the important information.",
			)
		) {
			deleteProject(project.id)
				.then(({ status, message }) => {
					if (status === "ok") {
						return listItem.remove();
					}

					alert(message);
				})
				.catch(() => alert("something went wrong"));
		}
	});

	projectLink.searchParams.set("project_id", project.id);

	projectNameElem.href = projectLink.href;
	projectNameElem.innerText = `${project.id}#${project.name}`;
	projectNameElem.classList.add(
		"inline-block",
		"w-full",
		"overflow-hidden",
		"text-ellipsis",
		"whitespace-nowrap",
		"text-lg",
		"font-medium",
	);

	projectDescElem.innerText = project.description || "No description";
	projectDescElem.classList.add(
		"w-full",
		"overflow-hidden",
		"text-ellipsis",
		"whitespace-nowrap",
		"text-gray-500",
	);

	function handleUpdateProject(this: HTMLFormElement, e: SubmitEvent) {
		e.preventDefault();

		const formData = new FormData(this);

		const projectData: unknown = Object.fromEntries(formData);

		updateProject(project.id, projectData as Project)
			.then(({ status, data, message }) => {
				if (status === "ok" && data !== null) {
					const { name, description } = data;

					projectNameElem.innerText = `${project.id}#${name}`;
					projectDescElem.innerText = description || "No description";

					updateProjectDialog.close();

					project = data;

					return;
				}

				alert(message);
			})
			.catch(() => alert("something went wrong"));
	}

	function handleCloseUpdateDialog(this: HTMLDialogElement) {
		formUpdateProject.reset();
		formUpdateProject.removeEventListener("submit", handleUpdateProject);
		this.removeEventListener("close", handleCloseUpdateDialog);
	}
}
