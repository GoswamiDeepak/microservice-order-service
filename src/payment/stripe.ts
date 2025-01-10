import Stripe from "stripe";
import config from "config";
import { PaymentGW, PaymentOptions } from "./paymentTypes";

export class StripeGW implements PaymentGW {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(config.get("stripe.secretKey"));
  }
  async createSession(option: PaymentOptions) {
    const session = await this.stripe.checkout.sessions.create({
      metadata: {
        orderId: option.orderId,
      },
      line_items: [
        {
          price_data: {
            unit_amount: option.amount * 100,
            product_data: {
              name: "Online Pizza order",
              description: "Order for online pizza",
              images: ["https://placehold.jp/150x150.png"],
            },
            currency: option.currency || "inr",
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${config.get("frontend.url")}/payment?sccess=true&orderId=${option.orderId}&tenantId=${option.tenantId}`,
      cancel_url: `${config.get("frontend.url")}/payment?sccess=false&orderId=${option.orderId}&tenantId=${option.tenantId}`,
    }, {idempotencyKey: option.idempotencyKey});
    return {
        id: session.id,
        paymentUrl: session.url,
        paymentStatus: session.payment_status
    };
  }

  async getSession() {
    return null;
  }
}
