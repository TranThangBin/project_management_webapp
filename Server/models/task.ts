import { Model, Schema, model } from "mongoose";
import { ProjectModel } from "./project";

type Task = {
	id: string;
	project_id: string;
	name: string;
	description?: string;
	expected_begin?: Date;
	expected_finish?: Date;
	status: "new" | "on going" | "finish";
	priority_level: number;
	created_at: Date;
};

const TaskSchema = new Schema<Task>({
	id: { type: String, required: true, unique: true },
	project_id: {
		type: String,
		required: true,
		validate: {
			validator: async (v: string) => {
				return (await ProjectModel.findOne({ id: v })) !== null;
			},
			message: "there are no instance of project with this id",
		},
	},
	name: { type: String, required: true },
	description: { type: String },
	expected_begin: { type: Date },
	expected_finish: { type: Date },
	status: {
		type: String,
		required: [true, "missing property status"],
		validate: {
			validator: (v: string) =>
				v === "new" || v === "on going" || v === "finish",
			message: "invalid value for status",
		},
	},
	priority_level: {
		type: Number,
		required: true,
		default: 0,
	},
	created_at: { type: Date, default: Date.now() },
});

TaskSchema.pre("validate", async function (next) {
	try {
		const Model = this.constructor as Model<Task>;

		const lastDoc = await Model.findOne(
			{},
			{ id: 1, _id: 0 },
			{ sort: { id: -1 } },
		).limit(1);

		if (lastDoc === null) {
			this.id = "TSK0001";
		} else {
			const lastID: string = lastDoc.id;
			const prevNumber = parseInt(lastID.substring(3)) + 1;
			this.id = "TSK" + prevNumber.toString().padStart(4, "0");
		}

		next();
	} catch (err) {
		if (err instanceof Error) {
			next(err);
			return;
		}

		console.warn("Unexpected error");
		console.error(err);
	}
});

export const TaskModel = model<Task>("task", TaskSchema);
