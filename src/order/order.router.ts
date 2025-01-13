import express from "express";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { OrderController } from "./order.controller";
import { createMessageBroker } from "../common/factories/brokerFactory";
import { stripeFactory } from "../common/factories/stripeFactory";

const router = express.Router();

const paymentGW = stripeFactory(); 
const broker = createMessageBroker();

const orderController = new OrderController(paymentGW, broker);

router.post("/", authenticate, asyncWrapper(orderController.createOrder)); 

export default router;
