import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All order routes are protected
router.use(verifyJWT);

router.route("/")
    .post(createOrder)
    .get(getMyOrders);

export default router;