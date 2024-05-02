import { Document, Schema, model } from "mongoose";
import { ProjectModel } from "./project-model";
import { applyCreatedAt, applyID, applyStatus } from "./utils";

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
	id: { type: String, immutable: true, unique: true, index: true },
	name: { type: String, required: true, minlength: 5 },
	description: { type: String },
	expected_begin: { type: Date },
	expected_finish: { type: Date },
	status: { type: String, enum: ["on going", "new", "finish"] },
	priority_level: {
		type: Number,
		required: true,
		min: 1,
		default: 1,
		get: (v: number) => Math.round(v),
		set: (v: number) => Math.round(v),
	},
	created_at: { type: Date, immutable: true },
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
});

TaskSchema.pre("save", applyID<Task>("TSK"));
TaskSchema.pre("save", applyCreatedAt<Task>());
TaskSchema.pre("save", applyStatus<Task>());
TaskSchema.pre("save", function (next) {
	ProjectModel.findOne({ id: this.project_id })
		.then((project) => {
			if (project?.status === "new") {
				ProjectModel.updateOne(
					{ id: this.project_id },
					{ $set: { status: "on going" } },
				)
					.then(() => next())
					.catch(next);
			}
		})
		.catch(next);
});

export const TaskModel = model<Task>("task", TaskSchema);
