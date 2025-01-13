import { PaymentGW } from "../../payment/paymentTypes";
import { StripeGW } from "../../payment/stripe";


let stripeInstance:PaymentGW | null= null;

export const stripeFactory = () => {
    if(!stripeInstance) {
        stripeInstance = new StripeGW();
    }
    return stripeInstance;
}