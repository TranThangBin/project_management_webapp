import {
	Project,
	createNewProject,
	getAllProject,
} from "./apisService/project-service";
import "/src/tailwind.css";

const projectFormDiaglog = document.querySelector(
	"dialog#project-form",
) as HTMLDialogElement;

const formNewProject = projectFormDiaglog.querySelector(
	"form#new-project",
) as HTMLFormElement;

const projectList = document.querySelector(
	"ul#project-list",
) as HTMLUListElement;

function addAllProjects() {
	getAllProject().then((payload) => {
		if (payload.status === "ok" && payload.data !== null) {
			const projects = payload.data;

			const projectCount = projects.length;

			for (let i = 0; i < projectCount; i++) {
				addOneProject(projects[i]);
			}

			return;
		}

		alert(payload.message);
	});
}

function addOneProject(project: Project) {
	const listItem = document.createElement("li");
	listItem.classList.add("rounded-lg", "bg-white", "p-2");

	projectList.appendChild(listItem);

	const lineBreak = document.createElement("hr");
	lineBreak.classList.add("border-black");

	const projectLink = new URL("/pages/project.html", document.location.origin);
	projectLink.searchParams.set("id", project.id);

	const projectNameElem = document.createElement("a");
	projectNameElem.classList.add(
		"inline-block",
		"w-full",
		"overflow-hidden",
		"text-ellipsis",
		"whitespace-nowrap",
		"text-lg",
		"font-medium",
	);

	const projectDescElem = document.createElement("div");
	projectDescElem.classList.add(
		"w-full",
		"overflow-hidden",
		"text-ellipsis",
		"whitespace-nowrap",
		"text-gray-500",
	);

	projectNameElem.href = projectLink.href;
	projectNameElem.innerText = project.name;
	projectDescElem.innerText = project.description || "No description";

	listItem.append(projectNameElem, lineBreak, projectDescElem);
}

document
	.querySelector("button#btn-open-form")!
	.addEventListener("click", () => projectFormDiaglog.showModal());

document
	.querySelector("button#btn-close-form")!
	.addEventListener("click", () => projectFormDiaglog.close());

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

	createNewProject(project as Project).then((payload) => {
		if (payload.status === "ok" && payload.data !== null) {
			addOneProject(payload.data);
		} else {
			alert(payload.message);
		}

		this.reset();
	});
});

addAllProjects();
