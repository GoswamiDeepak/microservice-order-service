import Stripe from "stripe";
import config from "config";
import { CustomMetadata, PaymentGW, PaymentOptions, VerifiedSession } from "./paymentTypes";

export class StripeGW implements PaymentGW {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(config.get("stripe.secretKey"));
  }

  async createSession(option: PaymentOptions) {
    const session = await this.stripe.checkout.sessions.create({
        // customer_email: option.email, // TODO: add email
        metadata: {
        orderId: option.orderId,
      },
      billing_address_collection: "required",
      // TODO: in future capture structured address form customer
    //   payment_intent_data: {
    //     shipping: {
    //         name: "Deepak Goswami",
    //         address: {
    //             line1: "123 Main St",
    //             city: "vrindavan",
    //             state: "UP",
    //             postal_code: "281121",
    //             country: "INDIA",
    //         },
    //     }
    //   },
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

  async getSession(id:string) {
    const session = await this.stripe.checkout.sessions.retrieve(id)
    const verifiedSession:VerifiedSession = {
      id: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata as unknown as CustomMetadata
    }
    return verifiedSession;
  }
}
