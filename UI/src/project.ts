import {
	getAllTaskForProject,
	getTaskByID,
	createTask,
	updateTask,
	deleteTask,
	Task,
} from "./apisService/task-service";

import "/src/tailwind.css";

type TaskStatus = Task["status"];

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

const btnRefreshNew = document.querySelector(
	"button#btn-refresh-new",
) as HTMLButtonElement;

const btnRefreshOnGoing = document.querySelector(
	"button#btn-refresh-on-going",
) as HTMLButtonElement;

const btnRefreshFinish = document.querySelector(
	"button#btn-refresh-finish",
) as HTMLButtonElement;

const updateTaskDialog = document.querySelector(
	"dialog#update-task-dialog",
) as HTMLDialogElement;

const formUpdateTask = updateTaskDialog.querySelector(
	"form#form-update-task",
) as HTMLFormElement;

const updateTaskInputs = formUpdateTask.querySelectorAll(
	"input,textarea",
) as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;

const btnCloseUpdateTask = updateTaskDialog.querySelector(
	"button#btn-close-dialog",
) as HTMLButtonElement;

const refreshStatus = (status: TaskStatus) => {
	let taskList: HTMLUListElement | undefined;

	switch (status) {
		case "new":
			taskList = listNewTask;
			break;

		case "on going":
			taskList = listOnGoingTask;
			break;

		case "finish":
			taskList = listFinishTask;
			break;

		default:
			throw new Error("unexpected task status");
	}

	while (taskList.lastChild) {
		taskList.removeChild(taskList.lastChild);
	}

	getAllTaskForProject(projectID, status)
		.then(renderTasks)
		.catch(() => alert("something went wrong"));
};

btnRefreshNew.addEventListener("click", () => refreshStatus("new"));
btnRefreshOnGoing.addEventListener("click", () => refreshStatus("on going"));
btnRefreshFinish.addEventListener("click", () => refreshStatus("finish"));

btnCloseUpdateTask.addEventListener("click", () => updateTaskDialog.close());

formAddTask.remove();

btnAddTask.addEventListener("click", function () {
	this.parentNode!.replaceChild(formAddTask, this);
});

btnCancel.addEventListener("click", function () {
	formAddTask.parentNode!.replaceChild(btnAddTask, formAddTask);
});

const createTaskComponent = (task: Task) => {
	const listItem = document.createElement("li");
	const descWrapper = document.createElement("div");
	const descContainer = document.createElement("div");
	const toolContainer = document.createElement("div");
	const btnMenu = document.createElement("button");
	const menuList = document.createElement("ul");
	const btnToNew = document.createElement("button");
	const btnToOnGoing = document.createElement("button");
	const btnToFinish = document.createElement("button");

	const updateTaskMenuItem = document.createElement("li");
	const deleteTaskMenuItem = document.createElement("li");
	const traceTaskMenuItem = document.createElement("li");

	const updateTaskBtn = document.createElement("button");
	const deleteTaskBtn = document.createElement("button");
	const traceTaskBtn = document.createElement("button");

	const taskTag = `${task.id}#${task.name}`;
	const taskDesc = task.description || "No description";

	let menuOn = false;
	btnMenu.addEventListener("click", () => {
		if (menuOn) {
			toolContainer.removeChild(menuList);
		} else {
			toolContainer.appendChild(menuList);
		}

		menuOn = !menuOn;
	});
	listItem.addEventListener("mouseleave", () => {
		if (menuOn) {
			toolContainer.removeChild(menuList);
			menuOn = false;
		}
	});

	const handleUpdateTask = function (this: HTMLFormElement, e: SubmitEvent) {
		e.preventDefault();

		const formData = new FormData(this);

		const taskData: unknown = Object.fromEntries(formData);

		updateTask(projectID, taskData as Task, task.id)
			.then(({ status, data, message }) => {
				if (status === "ok" && data !== null) {
					const { id, name, description } = data;

					const newTag = `${id}#${name}`;
					const newDesc = description || "No description";

					listItem.innerText.replace(taskTag, newTag);
					descContainer.innerText = newDesc;

					updateTaskDialog.close();

					task = data;

					return;
				}

				alert(message);
			})
			.catch(() => alert("something went wrong"));
	};

	const handleCloseUpdateDialog = function (this: HTMLDialogElement) {
		formUpdateTask.reset();
		formUpdateTask.removeEventListener("submit", handleUpdateTask);
		this.removeEventListener("close", handleCloseUpdateDialog);
	};

	updateTaskBtn.addEventListener("click", () => {
		updateTaskDialog.showModal();

		formUpdateTask.addEventListener("submit", handleUpdateTask);
		updateTaskDialog.addEventListener("close", handleCloseUpdateDialog);

		const inputCount = updateTaskInputs.length;

		for (let i = 0; i < inputCount; i++) {
			updateTaskInputs[i].value = task[
				updateTaskInputs[i].name as keyof Task
			] as string;
		}
	});

	deleteTaskMenuItem.addEventListener("click", () => {
		if (!confirm(taskTag + "\nare you sure to delete this task")) {
			return;
		}

		deleteTask(projectID, task.id)
			.then((payload) => {
				if (payload.status === "ok" && payload.data) {
					listItem.remove();
					return;
				}

				alert(payload.message);
			})
			.catch(() => alert("something went wrong"));
	});

	menuList.append(updateTaskMenuItem, deleteTaskMenuItem, traceTaskMenuItem);
	menuList.classList.add(
		"absolute",
		"right-3",
		"bg-zinc-700",
		"w-max",
		"z-10",
		"before:block",
		"before:border-4",
		"before:border-t-[0.5rem]",
		"before:border-zinc-400",
		"before:border-l-transparent",
		"before:border-t-transparent",
	);

	updateTaskMenuItem.classList.add("border", "border-zinc-400", "border-r-4");
	deleteTaskMenuItem.classList.add("border", "border-zinc-400", "border-r-4");
	traceTaskMenuItem.classList.add("border", "border-zinc-400", "border-r-4");

	updateTaskBtn.innerText = "Update Task";
	updateTaskBtn.classList.add("p-2", "w-full");

	deleteTaskBtn.innerText = "Delete Task";
	deleteTaskBtn.classList.add("p-2", "w-full");

	traceTaskBtn.innerText = "Trace Task";
	traceTaskBtn.classList.add("p-2", "w-full");

	updateTaskMenuItem.appendChild(updateTaskBtn);
	deleteTaskMenuItem.appendChild(deleteTaskBtn);
	traceTaskMenuItem.appendChild(traceTaskBtn);

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

	descContainer.innerText = taskDesc;
	descContainer.classList.add("min-h-0", "text-gray-400");

	toolContainer.classList.add(
		"absolute",
		"right-1",
		"top-1",
		"hidden",
		"group-hover:block",
	);

	btnMenu.innerHTML = '<i class="fa-solid fa-ellipsis"></i>';
	btnMenu.classList.add(
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

	toolContainer.appendChild(btnMenu);

	switch (task.status) {
		case "new":
			toolContainer.prepend(btnToOnGoing, btnToFinish);
			btnToOnGoing.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
			break;

		case "on going":
			toolContainer.prepend(btnToNew, btnToFinish);
			break;

		case "finish":
			toolContainer.prepend(btnToOnGoing, btnToNew);
			btnToOnGoing.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
			break;

		default:
			throw new Error("unexpected task status");
	}

	const updateTaskStatus = (status: TaskStatus) => {
		updateTask(projectID, { status }, task.id)
			.then((payload) => {
				if (payload.status === "ok" && payload.data !== null) {
					refreshStatus(status);
					listItem.remove();
					return;
				}

				alert(payload.message);
			})
			.catch(() => alert("something went wrong"));
	};

	btnToNew.addEventListener("click", () => updateTaskStatus("new"));
	btnToOnGoing.addEventListener("click", () => updateTaskStatus("on going"));
	btnToFinish.addEventListener("click", () => updateTaskStatus("finish"));

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

document.addEventListener("DOMContentLoaded", () =>
	getAllTaskForProject(projectID)
		.then(renderTasks)
		.catch(() => alert("something went wrong")),
);

function renderTasks(
	payload: Awaited<ReturnType<typeof getAllTaskForProject>>,
) {
	if (payload.status === "ok" && payload.data !== null) {
		const tasks = payload.data;

		const taskCount = tasks.length;

		for (let i = 0; i < taskCount; i++) {
			const task = tasks[i];
			const component = createTaskComponent(task);
			switch (task.status) {
				case "new":
					listNewTask.appendChild(component);
					break;

				case "on going":
					listOnGoingTask.appendChild(component);
					break;

				case "finish":
					listFinishTask.appendChild(component);
					break;

				default:
					break;
			}
		}

		return;
	}

	alert(payload.message);
}
