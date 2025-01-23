import { Request, Response } from "express";
import { PaymentGW } from "./paymentTypes";
import orderModel from "../order/order.model";
import { OrderStatus, PaymentStatus } from "../order/order.type";
import { MessageBroker } from "../types/broker";
import { OrderEvent } from "../types";
import customerModel from "../customer/customerModel";

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
            const customer = await customerModel.findOne({ _id: updatedOrder.customerId });

            //DONE: send update to kafka broker
            const brokerMessage = {
                event_type : OrderEvent.PAYMENT_STATUS_UPDATED,
                data: {...updatedOrder.toObject(), customerId: customer},
            }
            await this.broker.sendMessage('order-topic', JSON.stringify(brokerMessage), updatedOrder._id.toString())

            //TODO: THINK ABOUT BROKER MESSAGE FAILE

        }
        return res.json({success: true})
    }
}