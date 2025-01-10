import mongoose, { Schema } from "mongoose";
import { IOrder, OrderStatus, PaymentMode, PaymentStatus } from "./order.type";
import { CartItem } from "../types";

const toppingSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    price: Number,
    image: String,
})

const cartSchema = new mongoose.Schema<CartItem>({
    name: String,
    qty: Number,
    image: String,
    priceConfiguration: {
        type: Map,
        of: {
            priceType: {
                type: String,
                enum: ["base", "aditional"],
                required: true,
            },
            availableOptions: {
                type: Map,
                of: Number,
                required: true,
            },
        }
    },
    chosenConfiguration: {
        priceConfiguration: {
            type: Map,
            of : String,
            required: true,
        },
        selectedToppings: [
            {
                type: [toppingSchema],
                required: true,
            }
        ]
    }
})

const orderSchema = new mongoose.Schema<IOrder>({
    cart: {
        type: [cartSchema],
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: false,
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    tenantId: {
        type: String,
        required: true,
    },
    deliveryCharges: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    taxes: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: OrderStatus
    },
    paymentMode: {
        type: String,
        enum: PaymentMode,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: PaymentStatus,
        required: true,
    },
    paymentId: {
        type: String,
        required: false,
        default: null,
    }

}, {timestamps: true});

export default mongoose.model("Order", orderSchema);