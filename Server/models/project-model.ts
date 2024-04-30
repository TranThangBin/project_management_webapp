import { Schema, model, Document } from "mongoose";
import { applyCreatedAt, applyID, applyStatus, validateDate } from "./utils";
import { TaskModel } from "./task-model";

interface Project extends Document {
	id: string;
	name: string;
	description?: string;
	status: "new" | "on going" | "finish";
	estimated_finish?: Date;
	team_size: number;
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
		minlength: 5,
	},
	description: { type: String },
	status: {
		type: String,
		validate: {
			validator: function (v: string) {
				return v === "new" || v === "on going" || v === "finish";
			},
		},
	},
	estimated_finish: {
		type: Date,
		validate: {
			validator: async function (this: Project, v: Date) {
				let latest = await TaskModel.findOne(
					{ project_id: this.id },
					{ _id: 0, expected_finish: -1 },
				);

				if (latest !== null && latest.expected_finish) {
					return validateDate(v, (finish) => finish, latest.expected_finish);
				}

				latest = await TaskModel.findOne(
					{ project_id: this.id },
					{ _id: 0, expected_begin: -1 },
				);

				if (latest !== null && latest.expected_begin) {
					return validateDate(v, (begin) => begin + 1, latest.expected_begin);
				}

				return validateDate(v, (today) => today + 1);
			},
		},
	},
	team_size: { type: Number, min: 1, default: 1 },
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
