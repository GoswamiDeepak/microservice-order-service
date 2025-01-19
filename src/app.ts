import express, { Request, Response } from "express";
import cors from 'cors';
import config from 'config';
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import customerRouter from './customer/customerRouter'
import couponRouter from './coupon/coupon.router'
import orderRouter from './order/order.router'
import paymentRouter from './payment/paymentRouter'

const app = express();

app.use(
  cors({
      origin: [config.get('frontend.url'),"http://localhost:5173"],
      credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order service service!" });
});


app.use('/customer',customerRouter)
app.use('/coupon', couponRouter)
app.use('/order', orderRouter)
app.use('/payment', paymentRouter)

//global middleware
app.use(globalErrorHandler);

export default app;
