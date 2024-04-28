import { Model, Schema, model } from "mongoose";

type Project = {
	id: string;
	name: string;
	desciption?: string;
	status: "new" | "on going" | "finish";
	estimated_finish?: Date;
	team_size?: number;
	created_at?: Date;
};

const ProjectSchema = new Schema<Project>({
	id: { type: String, required: true, unique: true, index: true },
	name: {
		type: String,
		required: [true, "missing property name"],
	},
	desciption: { type: String },
	status: {
		type: String,
		required: [true, "missing property status"],
		validate: {
			validator: function (v: string) {
				return v === "new" || v === "on going" || v === "finish";
			},
			message: "invalid value for status",
		},
	},
	estimated_finish: { type: Date },
	team_size: { type: Number },
	created_at: {
		type: Date,
		required: true,
		default: Date.now(),
	},
});

ProjectSchema.pre("validate", async function (next) {
	try {
		const Model = this.constructor as Model<Project>;

		const lastDoc = await Model.findOne(
			{},
			{ id: 1, _id: 0 },
			{ sort: { id: -1 } },
		).limit(1);

		if (lastDoc === null) {
			this.id = "PRJ0001";
		} else {
			const lastID: string = lastDoc.id;
			const prevNumber = parseInt(lastID.substring(3)) + 1;
			this.id = "PRJ" + prevNumber.toString().padStart(4, "0");
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

export const ProjectModel = model<Project>("project", ProjectSchema);
