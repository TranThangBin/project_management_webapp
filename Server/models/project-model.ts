import { Schema, model, Document } from "mongoose";
import { applyCreatedAt, applyID, applyStatus } from "./utils";
import { TaskModel } from "./task-model";

interface Project extends Document {
	id: string;
	name: string;
	desciption?: string;
	status: "new" | "on going" | "finish";
	estimated_finish?: Date;
	team_size?: number;
	created_at: Date;
}

const ProjectSchema = new Schema<Project>({
	id: {
		type: String,
		immutable: true,
		unique: true,
		index: true,
	},
	name: {
		type: String,
		required: true,
	},
	desciption: { type: String },
	status: {
		type: String,
		validate: {
			validator: function (v: string) {
				return v === "new" || v === "on going" || v === "finish";
			},
		},
	},
	estimated_finish: { type: Date },
	team_size: { type: Number },
	created_at: {
		type: Date,
		immutable: true,
	},
});

ProjectSchema.pre("save", applyID<Project>("PRJ"));
ProjectSchema.pre("save", applyCreatedAt<Project>());
ProjectSchema.pre("save", applyStatus<Project>());
ProjectSchema.pre("findOneAndDelete", function (next) {
	const filter = this.getQuery() as Pick<Project, "id">;

	TaskModel.deleteMany({ project_id: filter.id })
		.then(() => next())
		.catch((err) => next(err));
});

export const ProjectModel = model<Project>("project", ProjectSchema);
