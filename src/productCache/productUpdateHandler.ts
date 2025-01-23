import { ProductMessage } from "../types";
import productCacheModel from "./productCacheModel";

export async function handleProductUpdate(message: string) {
  //wrap this parsing in try catch
  const product: ProductMessage = JSON.parse(message);
  return await productCacheModel.updateOne(
    {
      productId: product.data.id,
    },
    {
      $set: {
        priceConfiguration: product.data.priceConfiguration,
      },
    },
    {
      upsert: true,
    },
  );
}
