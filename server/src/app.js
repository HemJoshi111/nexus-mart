import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

//Routes Imports
import userRouter from './routes/user.routes.js';
import categoryRouter from './routes/category.routes.js';

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
app.use("/api/v1/users", userRouter)
app.use("/api/v1/categories", categoryRouter); 

// =========================================================
// 🛡️ GLOBAL ERROR HANDLER 
// =========================================================
app.use((err, req, res, next) => {
    // 1. If the error is an instance of our custom ApiError, use its status code
    const statusCode = err.statusCode || 500;

    // 2. Use its message or a default one
    const message = err.message || "Internal Server Error";

    // 3. Send the JSON response
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [], // Validation errors if any
        // stack: err.stack // Optional: Only show stack in dev mode for debugging
    });
});

export { app };