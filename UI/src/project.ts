import {
	getAllTaskForProject,
	getTaskByID,
	createTask,
	updateTask,
	deleteTask,
	Task,
} from "./apisService/task-service";

import "/src/tailwind.css";

const projectID = new URL(window.location.toString()).searchParams.get(
	"project_id",
);

if (projectID === null) {
	const message = "missing query project_id";

	alert(message);

	throw new Error(message);
}

const btnAddTask = document.querySelector(
	"button#btn-add-task",
) as HTMLButtonElement;

const formAddTask = document.querySelector(
	"form#form-add-task",
) as HTMLFormElement;

const btnCancel = formAddTask.querySelector(
	"button#btn-cancel",
) as HTMLButtonElement;

const listNewTask = document.querySelector(
	"ul#list-new-task",
) as HTMLUListElement;

const listOnGoingTask = document.querySelector(
	"ul#list-on-going",
) as HTMLUListElement;

const listFinishTask = document.querySelector(
	"ul#list-finish",
) as HTMLUListElement;

formAddTask.remove();

btnAddTask.addEventListener("click", function () {
	this.parentNode!.replaceChild(formAddTask, this);
});

btnCancel.addEventListener("click", function () {
	formAddTask.parentNode!.replaceChild(btnAddTask, formAddTask);
});

const createTaskComponent = (task: Task) => {
	const listItem = document.createElement("li");
	const taskTag = `${task.id}#${task.name}`;
	const descWrapper = document.createElement("div");
	const descContainer = document.createElement("div");
	const toolContainer = document.createElement("div");
	const btnEdit = document.createElement("button");
	const btnToNew = document.createElement("button");
	const btnToOnGoing = document.createElement("button");
	const btnToFinish = document.createElement("button");

	listItem.innerText = taskTag;
	listItem.classList.add(
		"group",
		"relative",
		"w-full",
		"break-words",
		"rounded-sm",
		"bg-zinc-700",
		"p-2",
	);

	descWrapper.appendChild(descContainer);
	descWrapper.classList.add(
		"grid",
		"w-full",
		"grid-rows-[0fr]",
		"overflow-hidden",
		"break-words",
		"transition-[grid-template-rows]",
		"group-hover:grid-rows-[1fr]",
	);

	descContainer.innerText = task.description || "No description";
	descContainer.classList.add("min-h-0", "text-gray-400");

	toolContainer.classList.add(
		"absolute",
		"right-1",
		"top-1",
		"hidden",
		"group-hover:block",
	);

	btnEdit.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
	btnEdit.classList.add(
		"rounded-full",
		"bg-zinc-700",
		"px-2",
		"py-1",
		"hover:bg-zinc-500",
	);

	btnToNew.innerHTML = '<i class="fa-solid fa-angles-left"></i>';
	btnToNew.classList.add(
		"rounded-full",
		"bg-zinc-700",
		"px-2",
		"py-1",
		"hover:bg-zinc-500",
	);

	btnToFinish.innerHTML = '<i class="fa-solid fa-angles-right"></i>';
	btnToFinish.classList.add(
		"rounded-full",
		"bg-zinc-700",
		"px-2",
		"py-1",
		"hover:bg-zinc-500",
	);

	btnToOnGoing.classList.add(
		"rounded-full",
		"bg-zinc-700",
		"px-3",
		"py-1",
		"hover:bg-zinc-500",
	);

	toolContainer.appendChild(btnEdit);

	switch (task.status) {
		case "new":
			toolContainer.append(btnToOnGoing, btnToFinish);
			btnToOnGoing.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
			break;

		case "on going":
			toolContainer.append(btnToNew, btnToFinish);
			break;

		case "finish":
			toolContainer.append(btnToOnGoing, btnToNew);
			btnToOnGoing.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
			break;

		default:
			break;
	}

	btnToNew.addEventListener("click", () => {
		updateTask(projectID, { status: "new" }, task.id).then((payload) => {
			if (payload.status === "ok" && payload.data !== null) {
				listNewTask.appendChild(listItem);

				if (task.status === "finish") {
					toolContainer.replaceChild(btnToFinish, btnToNew);
				} else if (task.status === "on going") {
					toolContainer.replaceChild(btnToOnGoing, btnToNew);
				}

				btnToOnGoing.innerHTML = '<i class="fa-solid fa-angle-right"></i>';

				task = payload.data;

				return;
			}

			alert(payload.message);
		});
	});

	btnToOnGoing.addEventListener("click", () => {
		updateTask(projectID, { status: "on going" }, task.id).then((payload) => {
			if (payload.status === "ok" && payload.data !== null) {
				listOnGoingTask.appendChild(listItem);

				if (task.status === "new") {
					toolContainer.replaceChild(btnToNew, btnToOnGoing);
				} else if (task.status === "finish") {
					toolContainer.replaceChild(btnToFinish, btnToOnGoing);
				}

				task = payload.data;

				return;
			}

			alert(payload.message);
		});
	});

	btnToFinish.addEventListener("click", () => {
		updateTask(projectID, { status: "finish" }, task.id).then((payload) => {
			if (payload.status === "ok" && payload.data !== null) {
				listFinishTask.appendChild(listItem);

				if (task.status === "new") {
					toolContainer.replaceChild(btnToNew, btnToFinish);
				} else if (task.status === "on going") {
					toolContainer.replaceChild(btnToOnGoing, btnToFinish);
				}

				btnToOnGoing.innerHTML = '<i class="fa-solid fa-angle-left"></i>';

				task = payload.data;

				return;
			}

			alert(payload.message);
		});
	});

	listItem.append(descWrapper, toolContainer);

	return listItem;
};

formAddTask.addEventListener("submit", function (e) {
	e.preventDefault();

	const formData = new FormData(this);

	const task: unknown = Object.fromEntries(formData);

	createTask(projectID!, task as Task)
		.then((payload) => {
			if (payload.status === "ok" && payload.data !== null) {
				listNewTask.appendChild(createTaskComponent(payload.data));
				this.parentNode!.replaceChild(btnAddTask, this);
				return;
			}

			alert(payload.message);
		})
		.catch(() => alert("something went wrong"));
});

const renderAllTasks = () => {
	getAllTaskForProject(projectID).then((payload) => {
		if (payload.status === "ok" && payload.data !== null) {
			const tasks = payload.data;

			const taskCount = tasks.length;

			for (let i = 0; i < taskCount; i++) {
				const task = tasks[i];
				switch (task.status) {
					case "new":
						listNewTask.appendChild(createTaskComponent(tasks[i]));
						break;

					case "on going":
						listOnGoingTask.appendChild(createTaskComponent(tasks[i]));
						break;

					case "finish":
						listFinishTask.appendChild(createTaskComponent(tasks[i]));
						break;

					default:
						break;
				}
			}

			return;
		}

		alert(payload.message);
	});
};

document.addEventListener("DOMContentLoaded", renderAllTasks);
