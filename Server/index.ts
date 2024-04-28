import express from "express";
import { DBConnect } from "./db/setup";

const PORT = 3000;

const app = express();

app.get("/", (_, res) => res.send("Hello world"));

app.listen(PORT, async () => {
	try {
		await DBConnect();
	} catch (err) {
		console.log("An error occurred when connecting to the database");
		console.error(err);
		process.exit(1);
	}
	console.log(`Listening at http://localhost:${PORT}`);
});
