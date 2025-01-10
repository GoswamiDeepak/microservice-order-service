import { Request } from "express";

export type AuthCookie = {
  accessToken: string;
};

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
    tenant: string;
  };
}

export interface priceConfiguration {
  priceType: "base" | "aditional"; // Type of pricing (base or additional)
  availableOptions: {
    [key: string]: number; // Key-value pairs for available pricing options
  };
}

// Define the interface for the Product Pricing Cache
export interface ProductPricingCache {
  productId: string; // Unique identifier for the product
  priceConfiguration: priceConfiguration;
}
export interface ProductMessage {
  id: string;
  priceConfiguration: ProductPricingCache;
}

export interface ToppingMessage {
  id: string;
  price: number;
}

export interface ProductPriceConfiguration {
  [key: string] : {
    priceType: "base" | "aditional",
    availableOptions: {
      [key:string] : number; 
    }
  }
}
export interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  priceConfiguration: ProductPriceConfiguration;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface CartItem extends Pick<Product, "_id" | "name" | "priceConfiguration" | "image"> {
  chosenConfiguration: {
    priceConfiguration: {
      [key: string]: string;
    };
    selectedToppings: Topping[];
  };
  qty: number;

}
