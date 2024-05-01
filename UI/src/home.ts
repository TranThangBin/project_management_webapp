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
				this.reset();
				projectList.appendChild(addOneProject(data));
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
					projectList.appendChild(addOneProject(projects[i]));
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

	const projectTag = `${project.id}#${project.name}`;
	const projectDesc = project.description || "No description";

	listItem.append(toolContainter, projectNameElem, projectDescElem);
	listItem.classList.add("rounded-lg", "bg-white", "p-2", "pt-0");

	toolContainter.append(updateProjectBtn, deleteProjectBtn);
	toolContainter.classList.add("border-b", "flex", "justify-end", "gap-2");

	updateProjectBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
	updateProjectBtn.title = `update project ${projectTag}`;

	deleteProjectBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
	deleteProjectBtn.title = `delete project ${projectTag}`;

	projectLink.searchParams.set("project_id", project.id);

	projectNameElem.href = projectLink.href;
	projectNameElem.innerText = projectNameElem.title = projectTag;
	projectNameElem.classList.add(
		"inline-block",
		"w-full",
		"truncate",
		"text-lg",
		"font-medium",
	);

	projectDescElem.innerText = projectDescElem.title = projectDesc;
	projectDescElem.classList.add("w-full", "truncate", "text-gray-500");

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

	return listItem;

	function handleUpdateProject(this: HTMLFormElement, e: SubmitEvent) {
		e.preventDefault();

		const formData = new FormData(this);

		const projectData: unknown = Object.fromEntries(formData);

		updateProject(project.id, projectData as Project)
			.then(({ status, data, message }) => {
				if (status === "ok" && data !== null) {
					const { name, description } = data;

					const newTag = `${project.id}#${name}`;
					const newDesc = description || "No description";

					projectNameElem.innerText = projectNameElem.title = newTag;
					projectDescElem.innerText = projectDescElem.title = newDesc;

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
