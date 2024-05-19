import {
	Project,
	createProject,
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

const updateProjectInputCount = updateProjectInputs.length;

const projectList = document.querySelector(
	"ul#project-list",
) as HTMLUListElement;

const projectElemMap = new Map<string, HTMLLIElement>();

document.addEventListener("DOMContentLoaded", renderProjects);

document
	.querySelector("button#btn-open-form")!
	.addEventListener("click", () => newProjectDialog.showModal());

document
	.querySelector("button#btn-close-createform")!
	.addEventListener("click", () => newProjectDialog.close());

document
	.querySelector("button#btn-close-updateform")!
	.addEventListener("click", () => updateProjectDialog.close());

document
	.querySelector("button#btn-refresh")!
	.addEventListener("click", () => renderProjects());

formNewProject.addEventListener("reset", function () {
	this.querySelector("input")!.focus();
});

formNewProject.addEventListener("submit", function (e) {
	e.preventDefault();

	const formData = new FormData(this);

	const project: unknown = Object.fromEntries(formData);

	createProject(project as Project)
		.then(({ status, data, message }) => {
			if (status === "ok" && data !== null) {
				this.reset();
				renderProject(data);
				newProjectDialog.close();
				return;
			}

			alert(message);
		})
		.catch((err) => {
			alert("something went wrong");
			console.error(err);
		});
});

formUpdateProject.addEventListener("reset", function () {
	this.querySelector("input")!.focus();
});

function renderProjects() {
	getAllProject()
		.then(({ status, data, message }) => {
			if (status === "ok" && data !== null) {
				const projectCount = data.length;

				for (let i = 0; i < projectCount; i++) {
					renderProject(data[i]);
				}

				return;
			}

			alert(message);
		})
		.catch((err) => {
			alert("something went wrong");
			console.error(err);
		});
}

function renderProject(project: Project) {
	let projectComponent = projectElemMap.get(project.id);

	if (projectComponent === undefined) {
		projectComponent = createProjectComponent(project);
		projectElemMap.set(project.id, projectComponent);
	}

	projectList.appendChild(projectComponent);
}

function createProjectComponent(project: Project) {
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
						listItem.remove();
						projectElemMap.delete(project.id);
						return;
					}

					alert(message);
				})
				.catch((err) => {
					alert("something went wrong");
					console.error(err);
				});
		}
	});

	updateProjectBtn.addEventListener("click", () => {
		updateProjectDialog.showModal();

		const handleUpdateProject = createUpdateProjectHandler(
			project.id,
			(data) => {
				const { name, description } = data;

				const newTag = `${project.id}#${name}`;
				const newDesc = description || "No description";

				projectNameElem.innerText = projectNameElem.title = newTag;
				projectDescElem.innerText = projectDescElem.title = newDesc;

				updateProjectDialog.close();

				project = data;
			},
		);

		formUpdateProject.addEventListener("submit", handleUpdateProject);

		updateProjectDialog.addEventListener(
			"close",
			createDialogCloseHandler(handleUpdateProject),
		);

		for (let i = 0; i < updateProjectInputCount; i++) {
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
}

function createUpdateProjectHandler(
	projectId: string,
	afterUpdate: (project: Project) => void,
) {
	return function (this: HTMLFormElement, e: SubmitEvent) {
		e.preventDefault();

		const formData = new FormData(this);

		const projectData: unknown = Object.fromEntries(formData);

		updateProject(projectId, projectData as Project)
			.then(({ status, data, message }) => {
				if (status === "ok" && data !== null) {
					afterUpdate(data);
					return;
				}

				alert(message);
			})
			.catch((err) => {
				alert("something went wrong");
				console.error(err);
			});
	};
}

function createDialogCloseHandler(
	updateProjectHandler: (this: HTMLFormElement, e: SubmitEvent) => void,
) {
	return handleCloseUpdateDialog;

	function handleCloseUpdateDialog(this: HTMLDialogElement) {
		formUpdateProject.reset();
		formUpdateProject.removeEventListener("submit", updateProjectHandler);
		this.removeEventListener("close", handleCloseUpdateDialog);
	}
}
