import { Response, Request } from "express";

export class OrderController {
    createOrder = async (req:Request, res: Response) => {
        res.json({message:'order created'})
    }
}