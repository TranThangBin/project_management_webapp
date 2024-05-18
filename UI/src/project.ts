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

const traceTaskDialog = document.querySelector(
	"dialog#trace-task-dialog",
) as HTMLDialogElement;

const formUpdateTask = updateTaskDialog.querySelector(
	"form#form-update-task",
) as HTMLFormElement;

const formTraceTask = traceTaskDialog.querySelector(
	"form#form-trace-task",
) as HTMLFormElement;

const updateTaskInputs = formUpdateTask.querySelectorAll(
	"input,textarea",
) as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;

const traceTaskInputs = traceTaskDialog.querySelectorAll("input");

const listStatusMap: Record<TaskStatus, HTMLUListElement> = {
	new: document.querySelector("ul#list-new-task") as HTMLUListElement,
	"on going": document.querySelector("ul#list-on-going") as HTMLUListElement,
	finish: document.querySelector("ul#list-finish") as HTMLUListElement,
};

const refreshStatus = (status: TaskStatus) => {
	let taskList = listStatusMap[status];

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

updateTaskDialog
	.querySelector("button#btn-close-updatedialog")!
	.addEventListener("click", () => updateTaskDialog.close());

traceTaskDialog
	.querySelector("button#btn-close-tracedialog")!
	.addEventListener("click", () => traceTaskDialog.close());

formAddTask.remove();

btnAddTask.addEventListener("click", function () {
	this.parentNode!.replaceChild(formAddTask, this);
});

btnCancel.addEventListener("click", function () {
	formAddTask.parentNode!.replaceChild(btnAddTask, formAddTask);
});

const createTaskComponent = (task: Task) => {
	const listItem = document.createElement("li");
	const taskTitleElem = document.createElement("h3");
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
	const beginAt = task.expected_begin
		? task.expected_begin.toString().split("T")[0]
		: "no date specified";
	const endAt = task.expected_finish
		? task.expected_finish.toString().split("T")[0]
		: "no date specified";

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
		if (menuOn) toolContainer.removeChild(menuList);
		menuOn = false;
	});

	const handleUpdateTask = function (this: HTMLFormElement, e: SubmitEvent) {
		e.preventDefault();

		const formData = new FormData(this);

		const taskData: unknown = Object.fromEntries(formData);

		updateTask(projectID, taskData as Task, task.id)
			.then(({ status, data, message }) => {
				if (status === "ok" && data !== null) {
					refreshStatus(data.status);
					updateTaskDialog.close();
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

	const handleTraceTask = function (this: HTMLFormElement, e: SubmitEvent) {
		e.preventDefault();

		const formData = new FormData(this);

		const taskData: unknown = Object.fromEntries(formData);

		updateTask(projectID, taskData as Task, task.id)
			.then(({ status, data, message }) => {
				if (status === "ok" && data !== null) {
					refreshStatus(data.status);
					traceTaskDialog.close();
					return;
				}

				alert(message);
			})
			.catch(() => alert("something went wrong"));
	};

	const handleCloseTraceDialog = function (this: HTMLDialogElement) {
		formTraceTask.reset();
		formTraceTask.removeEventListener("submit", handleUpdateTask);
		this.removeEventListener("close", handleCloseUpdateDialog);
	};

	traceTaskBtn.addEventListener("click", () => {
		traceTaskDialog.showModal();

		formTraceTask.addEventListener("submit", handleTraceTask);
		traceTaskDialog.addEventListener("close", handleCloseTraceDialog);

		const inputCount = traceTaskInputs.length;

		for (let i = 0; i < inputCount; i++) {
			const taskDate = task[traceTaskInputs[i].name as keyof Task];

			if (taskDate) {
				traceTaskInputs[i].value = taskDate.toString().split("T")[0];
			}
		}
	});

	deleteTaskMenuItem.addEventListener("click", () => {
		if (!confirm(taskTag + "\nare you sure to delete this task")) {
			return;
		}

		deleteTask(projectID, task.id)
			.then(({ status, data, message }) => {
				if (status === "ok" && data) {
					listItem.remove();
					return;
				}

				alert(message);
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

	taskTitleElem.innerText = taskTag;

	listItem.title = `Task priority: ${task.priority_level}, expected begin: ${beginAt}, expected finish: ${endAt}`;
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
			throw new Error("unexpected task status");
	}

	toolContainer.appendChild(btnMenu);

	const handleUpdateTaskStatus = (taskStatus: TaskStatus) => {
		updateTask(projectID, { status: taskStatus }, task.id)
			.then(({ status, data, message }) => {
				if (status === "ok" && data !== null) {
					refreshStatus(taskStatus);
					listItem.remove();
					return;
				}

				alert(message);
			})
			.catch(() => alert("something went wrong"));
	};

	btnToNew.addEventListener("click", () => handleUpdateTaskStatus("new"));
	btnToOnGoing.addEventListener("click", () =>
		handleUpdateTaskStatus("on going"),
	);
	btnToFinish.addEventListener("click", () => handleUpdateTaskStatus("finish"));

	listItem.append(taskTitleElem, descWrapper, toolContainer);

	return listItem;
};

formAddTask.addEventListener("submit", function (e) {
	e.preventDefault();

	const formData = new FormData(this);

	const task: unknown = Object.fromEntries(formData);

	createTask(projectID!, task as Task)
		.then(({ status, data, message }) => {
			if (status === "ok" && data !== null) {
				refreshStatus("new");
				this.parentNode!.replaceChild(btnAddTask, this);
				return;
			}

			alert(message);
		})
		.catch(() => alert("something went wrong"));
});

document.addEventListener("DOMContentLoaded", () =>
	getAllTaskForProject(projectID)
		.then(renderTasks)
		.catch(() => alert("something went wrong")),
);

function renderTasks({
	status,
	data,
	message,
}: Awaited<ReturnType<typeof getAllTaskForProject>>) {
	if (status === "ok" && data !== null) {
		const taskCount = data.length;

		for (let i = 0; i < taskCount; i++) {
			const task = data[i];
			const component = createTaskComponent(task);
			listStatusMap[task.status].appendChild(component);
		}

		return;
	}

	alert(message);
}
