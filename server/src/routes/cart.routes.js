import { Router } from "express";
import {
    addItemToCart,
    clearCart,
    getUserCart,
    removeItemFromCart
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All cart routes require a logged-in user
router.use(verifyJWT);

router.route("/")
    .get(getUserCart)
    .post(addItemToCart)
    .delete(clearCart);

router.route("/item/:productId")
    .delete(removeItemFromCart);

export default router;