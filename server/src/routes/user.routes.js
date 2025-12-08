import { Router } from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//can also be:
//router.post("/register", uploadMiddleware, registerUser)

// Route: POST /api/v1/users/register
router.route("/register").post(
    // 🛡️ Middleware: Inject Multer to handle file uploads
    upload.fields([
        {
            name: "avatar", // Must match field name in frontend/Postman
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    // 🧠 Controller: The actual logic
    registerUser
);

// Route: POST /api/v1/users/login
router.route("/login").post(loginUser);


//Route: POST /api/v1/users/logout
//Secured route
router.route("/logout").post(verifyJWT, logoutUser)

export default router;