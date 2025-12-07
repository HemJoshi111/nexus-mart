import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

//Routes Imports
import userRoute from "./routes/user.routes.js"

const app = express();

// 1. Configure CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// 2. Configure JSON limit
app.use(express.json({ limit: "16kb" }));

// 3. Configure URL encoded limit
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// 4. Configure Static assets
app.use(express.static("public"));

// 5. Configure Cookie Parser
app.use(cookieParser());


//Routes Declaration
app.use("api/v1/users", userRoute)

export { app };