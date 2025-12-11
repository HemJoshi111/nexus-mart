import { Router } from "express";
import {
    addProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public Routes (View Products)
router.route("/")
    .get(getAllProducts);

router.route("/:productId")
    .get(getProductById);

// Protected Routes (Manage Products)
router.route("/")
    .post(
        verifyJWT,
        upload.single("productImage"), // Handle single image upload
        addProduct
    );

router.route("/:productId")
    .patch(
        verifyJWT,
        upload.single("productImage"), // Optional image update
        updateProduct
    )
    .delete(verifyJWT, deleteProduct);

export default router;