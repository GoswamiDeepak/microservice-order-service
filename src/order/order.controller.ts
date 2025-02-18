// Import necessary modules and types
import { Response, Request, NextFunction } from "express"; // Express types for handling HTTP requests and responses
import { CartItem, ProductPricingCache, Topping, OrderEvent } from "../types"; // Custom types for cart items, product pricing, and toppings
import productCacheModel from "../productCache/productCacheModel"; // Model for interacting with the product pricing cache
import topppingCacheModel, { ToppingPriceCache } from "../toppingCache/topppingCacheModel"; // Model for interacting with the topping pricing cache
import { CouponModel } from "../coupon/coupon.model";
import { OrderStatus, PaymentMode, PaymentStatus } from "./order.type";
import orderModel from "./order.model";
import idempotencyModel from "../idempotency/idempotency.model";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import { PaymentGW } from "../payment/paymentTypes";
import { MessageBroker } from "../types/broker";
import { Request as JWTAuth } from "express-jwt";
import customerModel from "../customer/customerModel";
import { ROLES } from "../constant";
// Define the OrderController class
export class OrderController {
    constructor(
        private paymentGateway: PaymentGW,
        private broker: MessageBroker,
    ) {}

    // Method to create an order
    createOrder = async (req: Request, res: Response, next: NextFunction) => {
        // Destructure the required data from the request body
        const { cart, couponCode, tenantId, customerId, comment, address, paymentMode } = req.body;

        // TODO: Validate request data to ensure it contains valid cart information
        // Calculate the total price of the items in the cart using the `calculateTotal` method
        const totalPrice = await this.calculateTotal(cart);

        // Initialize discount percentage to 0
        let discountPercentage = 0;

        // If a coupon code is provided, calculate the discount percentage
        if (couponCode) {
            // Fetch the discount percentage using the `getDiscountPercentage` method
            discountPercentage = await this.getDiscountPercentage(couponCode, tenantId);
        }

        // Calculate the discount amount based on the total price and discount percentage
        const discountAmount = Math.round((totalPrice * discountPercentage) / 100);

        // Calculate the total price after applying the discount
        const priceAfterDiscount = totalPrice - discountAmount;

        // TODO: Store in db for each tenant
        const TAXES_PERCENTAGE = 18;

        // Calculate the taxes amount based on the total price and taxes percentage
        const taxesAmount = Math.round((priceAfterDiscount * TAXES_PERCENTAGE) / 100);

        // TODO: Store in db for each tenant
        const DELIVERY_CHARGES = 100;

        // Calculate the total price after applying the discount, taxes, and delivery charges
        const finalTotal = priceAfterDiscount + taxesAmount + DELIVERY_CHARGES;

        // TODO: Problams...
        // Create a new order object with the calculated total price, discount amount, and final total
        const order = {
            cart,
            address,
            comment,
            customerId,
            deliveryCharges: DELIVERY_CHARGES,
            discount: discountAmount,
            taxes: taxesAmount,
            tenantId,
            total: finalTotal,
            paymentMode,
            orderStatus: OrderStatus.RECEIVED,
            paymentStatus: PaymentStatus.PENDING,
        };

        // Retrieve the idempotency key from the request headers
        const idempotencyKey = req.headers["idempotency-key"];

        // Check if an idempotency record already exists for the given key
        const idempotency = await idempotencyModel.findOne({
            key: idempotencyKey,
        });

        let newOrder = idempotency ? [idempotency.response] : [];

        // If no idempotency record exists, create a new order and idempotency record
        if (!idempotency) {
            const session = await mongoose.startSession();
            await session.startTransaction();
            try {
                // Create the new order in the database within the transaction
                newOrder = await orderModel.create([order], {
                    session,
                });

                // Create an idempotency record to prevent duplicate orders
                await idempotencyModel.create(
                    [
                        {
                            key: idempotencyKey,
                            response: newOrder[0],
                        },
                    ],
                    { session },
                );

                // Commit the transaction if everything is successful
                await session.commitTransaction();
            } catch (error) {
                // Abort the transaction and handle the error
                await session.abortTransaction();
                await session.endSession();
                return next(createHttpError(500, error.message));
            } finally {
                // End the session
                await session.endSession();
            }
        }

        const customer = await customerModel.findOne({ _id: newOrder[0].customerId });
        const brokerMessage = {
            event_type: OrderEvent.ORDER_CREATED,
            data: { ...newOrder[0], customerId: customer },
        };
        // DONE: Payment processing logic can be added here
        // TODO: error handling
        // TODO: add logging
        if (paymentMode === PaymentMode.CARD) {
            const session = await this.paymentGateway.createSession({
                currency: "inr",
                amount: finalTotal,
                orderId: newOrder[0]._id.toString(),
                tenantId: tenantId,
                idempotencyKey: idempotencyKey as string,
            });

            // TODO: update order document -> paymentId
            await this.broker.sendMessage("order-topic", JSON.stringify(brokerMessage), newOrder[0]._id.toString());

            res.json({
                paymentUrl: session.paymentUrl,
            });
        }
        // Cash on delivery--------------------
        await this.broker.sendMessage("order-topic", JSON.stringify(brokerMessage), newOrder[0]._id.toString());

        res.json({
            paymentUrl: null,
        });
    };

    getMine = async (req: JWTAuth, res: Response, next: NextFunction) => {
        const userId = req.auth.sub;
        if (!userId) {
            return next(createHttpError(400, "No userId found."));
        }
        //TODO: Add error handling
        const customer = await customerModel.findOne({ userId });

        if (!customer) {
            return next(createHttpError(400, "No customer found."));
        }
        //TODO: implement pagination
        const orders = await orderModel.find({ customerId: customer._id }, { cart: 0 });

        return res.json(orders);
    };
    getSingle = async (req: JWTAuth, res: Response, next: NextFunction) => {
        const orderId = req.params.orderId;
        const { sub: userId, role, tenant: tenantId } = req.auth;
        const fields = req.query.fields ? req.query.fields.toString().split(",") : []; //['orderStatus', 'paymentStatus']
        const projection = fields.reduce(
            (acc, field) => {
                // return {
                //     ...acc,
                //     [field]: 1,
                // }
                acc[field] = 1;
                return acc;
            },
            { customerId: 1 },
        );
        const order = await orderModel
            .findOne({ _id: orderId }, projection)
            .populate("customerId", "firstname lastname");
        if (!order) {
            return next(createHttpError(400, "No order found."));
        }
        if (role === ROLES.ADMIN) {
            return res.json(order);
        }

        const myRestaurentOrder = order.tenantId === tenantId;
        if (role === ROLES.MANAGER && myRestaurentOrder) {
            return res.json(order);
        }
        if (role === ROLES.CUSTOMER) {
            const customer = await customerModel.findOne({ userId });
            if (!customer) {
                return next(createHttpError(400, "No customer found."));
            }
            if (order.customerId._id.toString() === customer._id.toString()) {
                return res.json(order);
            }
        }
        return next(createHttpError(403, "Operation not permitted."));
    };

    getAll = async (req: JWTAuth, res: Response, next: NextFunction) => {
        const { role, tenant: restaurentID } = req.auth;

        const tenantId = req.query.tenantId;

        if (role === ROLES.CUSTOMER) {
            return createHttpError(403, "YOu are not allowed.");
        }

        if (role === ROLES.ADMIN) {
            const filter = {};

            if (tenantId) {
                filter["tenantId"] = tenantId;
            }
            //TODO: pagniation
            //TODO: ADD Logger
            const orders = await orderModel.find(filter, {}, { sort: { createAt: -1 } }).populate("customerId");
            return res.json(orders);
        }

        if (role === ROLES.MANAGER) {
            //TODO: Add pagination
            const orders = await orderModel
                .find({ tenantId: restaurentID }, {}, { sort: { createAt: -1 } })
                .populate("customerId");
            return res.json(orders);
        }

        return next(createHttpError(403, "not permitted."));
    };

    changeOrderStatus = async (req: JWTAuth, res: Response, next: NextFunction) => {
        const orderId = req.params.orderId;
        const { role, tenant: restaurentID } = req.auth;

        if (role === ROLES.ADMIN || role === ROLES.MANAGER) {
            const order = await orderModel.findOne({ _id: orderId });

            if (!order) {
                return next(createHttpError(400, "No order found."));
            }

            const brokerMessage = {
                event_type: OrderEvent.ORDER_STATUS_UPDATED,
                data: order,
            };

            // if(role === ROLES.ADMIN) {
            //     order.orderStatus = req.body.status;
            //     await order.save();
            //     return res.json(order)
            // }

            const isMyRestaurentOrder = order.tenantId === restaurentID;

            // if(role === ROLES.ADMIN && !isMyRestaurentOrder) {
            //     return next(createHttpError(403, "Operation not permitted."))
            // }

            if (role === ROLES.MANAGER && !isMyRestaurentOrder) {
                return next(createHttpError(403, "Operation not permitted."));
            }

            if ((role === ROLES.MANAGER && isMyRestaurentOrder) || role === ROLES.ADMIN) {
                // TODO: put proper validation on orderStatus
                const updatedOrder = await orderModel.findOneAndUpdate(
                    { _id: orderId },
                    { orderStatus: req.body.status },
                    { new: true },
                );
                const customer = await customerModel.findOne({ _id: updatedOrder.customerId });
                const brokerMessage = {
                    event_type: OrderEvent.ORDER_STATUS_UPDATED,
                    data: {...updatedOrder.toObject(), customerId: customer},
                };

                //DONE: send to kafka
                await this.broker.sendMessage(
                    "order-topic",
                    JSON.stringify(brokerMessage),
                    updatedOrder._id.toString(),
                );
                return res.json({ _id: updatedOrder._id });
            }
        }
        return next(createHttpError(403, "Operation not permitted."));
    };

    // Private method to calculate the total price of items in the cart
    private calculateTotal = async (cart: CartItem[]) => {
        // Extract product IDs from the cart items
        const productIds = cart.map((item) => item._id);

        // Fetch product pricing information from the cache for the extracted product IDs
        const productPricings = await productCacheModel.find({
            productId: { $in: productIds },
        });
        // TODO: Handle cases where product pricing is not found in the cache
        // Possible solutions: Call the catalog service or use a fallback price

        // Extract topping IDs from the cart items
        const cartToppingIds = cart.reduce((acc, item) => {
            return [...acc, ...item.chosenConfiguration.selectedToppings.map((topping) => topping._id)];
        }, []);
        // Fetch topping pricing information from the cache for the extracted topping IDs
        const toppingPriceings = await topppingCacheModel.find({
            toppingId: { $in: cartToppingIds },
        });
        // TODO: Handle cases where topping pricing is not found in the cache
        // Possible solutions: Call the catalog service or use a fallback price

        // Calculate the total price by iterating through the cart items
        const totalPrice = cart.reduce((acc, item) => {
            // Find the cached product price for the current item
            const cachedProductPrice = productPricings.find((product) => product.productId === item._id);
            // Calculate the total price for the current item (including toppings) and add it to the accumulator
            return acc + item.qty * this.getItemTotal(item, cachedProductPrice, toppingPriceings);
        }, 0);
        // Return the calculated total price
        return totalPrice;
    };

    // Private method to calculate the total price for a single cart item
    private getItemTotal = (
        item: CartItem,
        cachedProductPrice: ProductPricingCache,
        toppingPriceings: ToppingPriceCache[],
    ) => {
        // Calculate the total price for selected toppings
        const toppingTotal = item.chosenConfiguration.selectedToppings.reduce((acc, curr) => {
            return acc + this.getCurrentToppingPrice(curr, toppingPriceings);
        }, 0);
        // Calculate the base price of the product based on its configuration
        const productTotal = Object.entries(item.chosenConfiguration.priceConfiguration).reduce((acc, [key, value]) => {
            const price = cachedProductPrice.priceConfiguration[key].availableOptions[value];
            return acc + price;
        }, 0);

        // Return the sum of the product total and topping total
        return productTotal + toppingTotal;
    };

    // Private method to get the price of a specific topping
    private getCurrentToppingPrice = (topping: Topping, toppingPriceings: ToppingPriceCache[]): number => {
        // Find the topping in the cached topping prices
        const currentTopping = toppingPriceings.find((current) => current.toppingId === topping._id);
        // If the topping is not found in the cache, use the price provided in the cart
        if (!currentTopping) {
            // TODO: Ensure the item is in the cache or call the catalog service to fetch the price
            return topping.price;
        }

        // Return the cached topping price as a number
        return Number(currentTopping.price);
    };

    // Private method to calculate the total discount based on a coupon code and tenant ID
    private getDiscountPercentage = async (couponCode: string, tenantId: string) => {
        // Find the coupon in the database using the coupon code and tenant ID
        const code = await CouponModel.findOne({
            code: couponCode,
            tenantId: tenantId,
        });

        // If the coupon is not found, return a discount of 0
        if (!code) {
            return 0;
        }

        // Get the current date and the coupon's expiration date
        const currentDate = new Date(); // Current date and time
        const couponDate = new Date(code.validUpto); // Expiration date of the coupon

        // Check if the coupon is still valid (current date is before or equal to the expiration date)
        if (currentDate <= couponDate) {
            // If the coupon is valid, return the discount amount
            return code.discount;
        }

        // If the coupon is expired, return a discount of 0
        return 0;
    };
}
