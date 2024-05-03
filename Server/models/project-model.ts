import { Schema, model, Document } from "mongoose";
import { applyCreatedAt, applyID, applyStatus } from "./utils";
import { TaskModel } from "./task-model";

interface Project extends Document {
	id: string;
	name: string;
	description?: string;
	status: "new" | "on going" | "finish";
	estimated_finish?: Date;
	team_size: number;
	created_at: Date;
	updated_at: Date;
}

const ProjectSchema = new Schema<Project>({
	id: { type: String, immutable: true, unique: true, index: true },
	name: { type: String, required: true, minlength: 5, trim: true },
	description: { type: String, trim: true },
	status: { type: String, enum: ["on going", "new", "finish"] },
	estimated_finish: { type: Date },
	team_size: {
		type: Number,
		min: 1,
		default: 1,
		get: (v: number) => Math.round(v),
		set: (v: number) => Math.round(v) || 1,
	},
	created_at: { type: Date, immutable: true },
});

ProjectSchema.pre("save", applyID<Project>("PRJ"));
ProjectSchema.pre("save", applyCreatedAt<Project>());
ProjectSchema.pre("save", applyStatus<Project>());
ProjectSchema.pre("findOneAndDelete", function (next) {
	const filter = this.getQuery() as Pick<Project, "id">;

	TaskModel.deleteMany({ project_id: filter.id })
		.then(() => next())
		.catch(next);
});

export const ProjectModel = model<Project>("project", ProjectSchema);
