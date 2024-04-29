import { type Model, type PreMiddlewareFunction, Document } from "mongoose";

interface DocumentWithID extends Document {
	id: string;
}

export function applyID<T extends DocumentWithID>(
	prefix: string,
): PreMiddlewareFunction<DocumentWithID> {
	return async function (next) {
		if (!this.isNew) {
			return next();
		}

		try {
			const Model = this.constructor as Model<T>;

			const lastDoc = await Model.findOne(
				{},
				{ id: 1, _id: 0 },
				{ sort: { id: -1 } },
			).limit(1);

			if (lastDoc === null) {
				this.id = prefix + "0001";
			} else {
				const lastID: string = lastDoc.id;
				const prevNumber = parseInt(lastID.substring(3)) + 1;
				this.id = prefix + prevNumber.toString().padStart(4, "0");
			}

			next();
		} catch (err) {
			if (err instanceof Error) {
				return next(err);
			}

			console.warn("Unexpected error");
			console.error(err);
		}
	};
}

interface DocumentWithCreatedAt extends Document {
	created_at: Date;
}

export function applyCreatedAt<
	T extends DocumentWithCreatedAt,
>(): PreMiddlewareFunction<T> {
	return function (next) {
		if (this.isNew) {
			this.created_at = new Date();
		}

		next();
	};
}

interface DocumentWithStatus extends Document {
	status: "new" | "on going" | "finish";
}

export function applyStatus<
	T extends DocumentWithStatus,
>(): PreMiddlewareFunction<T> {
	return function (next) {
		if (this.isNew) {
			this.status = "new";
		}

		next();
	};
}

export function validateDate(v: Date, from: Date, after: number) {
	const nextDay = new Date();
	nextDay.setDate(from.getDate() + after);
	nextDay.setHours(0, 0, 0, 0);
	return v === null || v >= nextDay;
}
