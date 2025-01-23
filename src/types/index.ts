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
export enum ProductEvent {
  PRODUCT_CREATE = "PRODUCT_CREATE",
  PRODUCT_UPDATE = "PRODUCT_UPDATE",
  PRODUCT_DELETE = "PRODUCT_DELETE"
 }
export interface ProductMessage {
  event_type: ProductEvent;
  data: {
    id: string;
    priceConfiguration: ProductPricingCache;
  }
}
export enum ToppingEvents {
  TOPPING_CREATE = "TOPPING_CREATE",
  TOPPING_UPDATE = "TOPPING_UPDATE",
  TOPPING_DELETE = "TOPPING_DELETE"
}
export interface ToppingMessage {
  event_type: ToppingEvents;
  data: {
    id: string;
    price: number;
    tenantId: string;
  }

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
  _id: string;
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

export enum OrderEvent {
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_STATUS_UPDATED = "ORDER_STATUS_UPDATED",
  PAYMENT_STATUS_UPDATED = "PAYMENT_STATUS_UPDATED"
}


