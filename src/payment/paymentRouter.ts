import express from 'express';
import { asyncWrapper } from '../utils';
import { PaymentController } from './paymentController';
import { createMessageBroker } from '../common/factories/brokerFactory';
import { stripeFactory } from '../common/factories/stripeFactory';

const router = express.Router();

const paymentGW = stripeFactory(); // DONE: create it singleton
const broker = createMessageBroker();

const paymentController = new PaymentController(paymentGW, broker);

router.post('/webhook', asyncWrapper(paymentController.handleWebHook))

export default router;