import mongoose from "mongoose";
import { ProductPricingCache } from "../types";



// Define the schema for the price configuration
const priceSchema = new mongoose.Schema({
    priceType: {
        type: String,
        enum: ["base", "aditional"], // Restrict values to 'base' or 'aditional'
    },
    availableOptions: {
        type: Object, // Dynamic key-value pairs
        of: Number, // Values must be numbers
    },
});

// Define the schema for the Product Pricing Cache
const productCacheSchema = new mongoose.Schema<ProductPricingCache>({
    productId: {
        type: String,
        required: true, // productId is a required field
    },
    priceConfiguration: {
        type: Object, // Nested object for price configuration
        of: priceSchema, // Use the priceSchema for validation
    },
});

// Create and export the Mongoose model for the Product Pricing Cache
export default mongoose.model(
    "ProductPricingCache", // Model name
    productCacheSchema, // Schema definition
    "productCache", // Collection name in MongoDB
);