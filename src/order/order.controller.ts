// Import necessary modules and types
import { Response, Request } from "express"; // Express types for handling HTTP requests and responses
import { CartItem, ProductPricingCache, Topping } from "../types"; // Custom types for cart items, product pricing, and toppings
import productCacheModel from "../productCache/productCacheModel"; // Model for interacting with the product pricing cache
import topppingCacheModel, {
  ToppingPriceCache,
} from "../toppingCache/topppingCacheModel"; // Model for interacting with the topping pricing cache
import { CouponModel } from "../coupon/coupon.model";

// Define the OrderController class
export class OrderController {
  // Method to create an order
createOrder = async (req: Request, res: Response) => {
    // TODO: Validate request data to ensure it contains valid cart information
    // Calculate the total price of the items in the cart using the `calculateTotal` method
    const totalPrice = await this.calculateTotal(req.body.cart);

    // Initialize discount percentage to 0
    let discountPercentage = 0;

    // Extract the coupon code and tenant ID from the request body
    const couponCode = req.body.couponCode;
    const tenantId = req.body.tenantId;

    // If a coupon code is provided, calculate the discount percentage
    if (couponCode) {
        // Fetch the discount percentage using the `getDiscountPercentage` method
        discountPercentage = await this.getDiscountPercentage(couponCode, tenantId);
    }

    // Calculate the discount amount based on the total price and discount percentage
    const discountAmount = Math.round((totalPrice * discountPercentage) / 100);

    // Send a JSON response with a success message, the total price, and the discount amount
    res.json({ message: "order created", totalPrice, discountAmount });
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
      return [
        ...acc,
        ...item.chosenConfiguration.selectedToppings.map(
          (topping) => topping.id,
        ),
      ];
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
      const cachedProductPrice = productPricings.find(
        (product) => product.productId === item._id,
      );

      // Calculate the total price for the current item (including toppings) and add it to the accumulator
      return (
        acc +
        item.qty * this.getItemTotal(item, cachedProductPrice, toppingPriceings)
      );
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
    const toppingTotal = item.chosenConfiguration.selectedToppings.reduce(
      (acc, curr) => {
        return acc + this.getCurrentToppingPrice(curr, toppingPriceings);
      },
      0,
    );

    // Calculate the base price of the product based on its configuration
    const productTotal = Object.entries(
      item.chosenConfiguration.priceConfiguration,
    ).reduce((acc, [key, value]) => {
      const price =
        cachedProductPrice.priceConfiguration[key].availableOptions[value];
      return acc + price;
    }, 0);

    // Return the sum of the product total and topping total
    return productTotal + toppingTotal;
  };

  // Private method to get the price of a specific topping
  private getCurrentToppingPrice = (
    topping: Topping,
    toppingPriceings: ToppingPriceCache[],
  ): number => {
    // Find the topping in the cached topping prices
    const currentTopping = toppingPriceings.find(
      (current) => current.toppingId === topping.id,
    );

    // If the topping is not found in the cache, use the price provided in the cart
    if (!currentTopping) {
      // TODO: Ensure the item is in the cache or call the catalog service to fetch the price
      return topping.price;
    }

    // Return the cached topping price as a number
    return Number(currentTopping.price);
  };

  // Private method to calculate the total discount based on a coupon code and tenant ID
  private getDiscountPercentage = async (
    couponCode: string,
    tenantId: string,
  ) => {
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
