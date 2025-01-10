import express from 'express';
import authenticate from '../common/middleware/authenticate';
import { asyncWrapper } from '../utils';
import { OrderController } from './order.controller';
const router = express.Router();

const orderController = new OrderController();
router.post('/', 
    // authenticate, 
    asyncWrapper(orderController.createOrder));

export default router;
