import { Document, Schema, model } from "mongoose";
import { ProjectModel } from "./project-model";
import { applyCreatedAt, applyID, applyStatus, validateDate } from "./utils";

interface Task extends Document {
	id: string;
	project_id: string;
	name: string;
	description?: string;
	expected_begin?: Date;
	expected_finish?: Date;
	status: "new" | "on going" | "finish";
	priority_level: number;
	created_at: Date;
}

const TaskSchema = new Schema<Task>({
	id: {
		type: String,
		immutable: true,
		unique: true,
		index: true,
	},
	project_id: {
		type: String,
		required: true,
		immutable: true,
		index: true,
		validate: {
			validator: async (v: string) => {
				return (await ProjectModel.findOne({ id: v })) !== null;
			},
		},
	},
	name: { type: String, required: true, minlength: 5 },
	description: { type: String },
	expected_begin: {
		type: Date,
		validate: {
			validator: async function (this: Task, v: Date) {
				const project = await ProjectModel.findOne({ id: this.project_id });

				if (project !== null && project.estimated_finish) {
					return validateDate(
						v,
						(fromDate) => fromDate - 1,
						project.estimated_finish,
					);
				}

				return validateDate(v, (today) => today + 1);
			},
		},
	},
	expected_finish: {
		type: Date,
		validate: {
			validator: async function (this: Task, v: Date) {
				const begin = this.expected_begin;

				if (begin) {
					return validateDate(v, (fromBegin) => fromBegin + 1, begin);
				}

				const project = await ProjectModel.findOne({ id: this.project_id });

				if (project !== null && project.estimated_finish) {
					return validateDate(
						v,
						(sameDate) => sameDate,
						project.estimated_finish,
					);
				}

				return validateDate(v, (today) => today + 1);
			},
		},
	},
	status: {
		type: String,
		validate: {
			validator: (v: string) =>
				v === "new" || v === "on going" || v === "finish",
		},
	},
	priority_level: {
		type: Number,
		required: true,
		default: 0,
		min: 0,
	},
	created_at: {
		type: Date,
		immutable: true,
	},
});

TaskSchema.pre("save", applyID<Task>("TSK"));
TaskSchema.pre("save", applyCreatedAt<Task>());
TaskSchema.pre("save", applyStatus<Task>());

export const TaskModel = model<Task>("task", TaskSchema);
