import { Router } from "express";
import {
    addProduct,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Protected Routes (Manage Products)
router.route("/")
    .post(
        verifyJWT,
        upload.single("productImage"), // Handle single image upload
        addProduct
    );


router.route("/:productId")
    .delete(verifyJWT, deleteProduct);
export default router;