import { Response, Request } from "express";
import { CartItem, ProductPricingCache, Topping } from "../types";
import productCacheModel from "../productCache/productCacheModel";
import topppingCacheModel, { ToppingPriceCache } from "../toppingCache/topppingCacheModel";

export class OrderController {
    createOrder = async (req:Request, res: Response) => {
        //todo: calidate request data
        const totalPrice = await this.calculateTotalPrice(req.body.cart); 
        
        res.json({message:'order created', totalPrice})
    }

    private calculateTotalPrice = async (cart: CartItem[]) => {
        const productIds = cart.map((item) => item._id);
        //error handleing
        const productPricings = await productCacheModel.find({
            productId: { $in: productIds },
        })

        //todo: what will happen if product does not exist in the cache
        // call catalog service 
        // user price form cart <-BAD

        const cartToppingIds = cart.reduce((acc, item)=>{
            return [
                ...acc,
                ...item.chosenConfiguration.selectedToppings.map((topping) => topping.id)
            ]
        },[]);
        //todo: what will happen if topping does not exitsts in the cache
        const toppingPriceings = await topppingCacheModel.find({
            toppingId: { $in: cartToppingIds },
        })

        const totalPrice = cart.reduce((acc, item) => {
            const cachedProductPrice = productPricings.find((product) => product.productId === item._id);
            return (
                acc + item.qty * this.getItemTotal(item, cachedProductPrice, toppingPriceings)
            )
        }, 0);

        return totalPrice;
    }

    private getItemTotal = (item: CartItem, cachedProductPrice: ProductPricingCache, toppingPriceings: ToppingPriceCache[]) => {
        const toppingTotal = item.chosenConfiguration.selectedToppings.reduce((acc, curr) => {
            return acc + this.getCurrentToppingPrice(curr, toppingPriceings)
        },0)

        const productTotal = Object.entries(item.chosenConfiguration.priceConfiguration).reduce((acc, [key, value]) => {
           const price = cachedProductPrice.priceConfiguration[key].availableOptions[value]
           return acc + price
        },0)

        return productTotal + toppingTotal
    }

    private getCurrentToppingPrice = (topping:Topping, toppingPriceings:ToppingPriceCache[]):number => {
        const currentTopping = toppingPriceings.find(current => current.toppingId === topping.id)

        if(!currentTopping) {
            // todo: make sure the item is in the cache else, maybe call catalog service
            return topping.price;
        }

        return Number(currentTopping.price) // Ensure it returns a number
    }
}