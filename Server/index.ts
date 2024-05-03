import express from "express";
import cors from "cors";
import { DBConnect } from "./db/setup";
import { projectRoute } from "./routes/project-route";
import { errorHandler } from "./controllers/error-handler";

const PORT = 3000;

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/project", projectRoute);

app.use(errorHandler);

app.listen(PORT, async () => {
    try {
        await DBConnect();
        console.log(`Listening at http://localhost:${PORT}`);
    } catch (err) {
        console.error("An error occurred when connecting to the database", err);
        process.exit(1);
    }
});
