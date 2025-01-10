import express from "express";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { OrderController } from "./order.controller";
import { StripeGW } from "../payment/stripe";
const router = express.Router();

const paymentGW = new StripeGW();
const orderController = new OrderController(paymentGW);

router.post("/", authenticate, asyncWrapper(orderController.createOrder));

export default router;
