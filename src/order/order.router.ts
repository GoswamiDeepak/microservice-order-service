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
router.get("/mine", authenticate, asyncWrapper(orderController.getMine)); 
router.get("/:orderId", authenticate, asyncWrapper(orderController.getSingle)); 
router.get("/", authenticate, asyncWrapper(orderController.getAll)); 
router.patch("/change-status/:orderId", authenticate, asyncWrapper(orderController.changeOrderStatus)); 

export default router;
