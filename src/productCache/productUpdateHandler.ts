import { ProductMessage } from "../types";
import productCacheModel from "./productCacheModel";

export async function handleProductUpdate(message: string) {
  //wrap this parsing in try catch
  const product: ProductMessage = JSON.parse(message);
  return await productCacheModel.updateOne(
    {
      productId: product.id,
    },
    {
      $set: {
        priceConfiguration: product.priceConfiguration,
      },
    },
    {
      upsert: true,
    },
  );
}
