import { Request, Response } from "express";
import { PaymentGW } from "./paymentTypes";
import orderModel from "../order/order.model";
import { PaymentStatus } from "../order/order.type";
import { MessageBroker } from "../types/broker";

export class PaymentController {
    constructor(private paymentGateway: PaymentGW, private broker: MessageBroker){}

    handleWebHook =async(req:Request, res:Response) => {
        const webhookbody = req.body;
        if(webhookbody.type === 'checkout.session.completed') {
            const verifiedSession = await this.paymentGateway.getSession(webhookbody.data.object.id)
            const isPaymentSuccess = verifiedSession.paymentStatus === 'paid'
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const updatedOrder = await orderModel.findOneAndUpdate({_id: verifiedSession.metadata.orderId},{
                paymentStatus: isPaymentSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED
            },{
                new: true
            })

            //DONE: send update to kafka broker
            //TODO: THINK ABOUT BROKER MESSAGE FAILED

            await this.broker.sendMessage('order-topic', JSON.stringify(updatedOrder))
        }
        return res.json({success: true})
    }
}