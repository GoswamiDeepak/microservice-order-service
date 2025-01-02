import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import customerRouter from './customer/customerRouter'
import couponRouter from './coupon/coupon.router'

const app = express();

app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order service service!" });
});


app.use('/customer',customerRouter)
app.use('/coupon', couponRouter)

//global middleware
app.use(globalErrorHandler);

export default app;
