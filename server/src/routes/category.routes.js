import { Router } from "express";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    updateCategory
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Route: Anyone can see categories
router.route("/").get(getAllCategories);

// Protected Routes: Only logged in users (Admins) can modify
router.route("/").post(verifyJWT, createCategory);

// For Update and Delete, we need the specific ID in the URL
router.route("/:categoryId")
    .patch(verifyJWT, updateCategory)
    .delete(verifyJWT, deleteCategory);

export default router;