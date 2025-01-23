import { ToppingMessage } from "../types";
import topppingCacheModel from "./topppingCacheModel";

export async function handleToppingUpdate(message: string) {
    //wrap this parsing in try catch

   try {
     const topping: ToppingMessage = JSON.parse(message);
     return await topppingCacheModel.updateOne(
         {
             toppingId: topping.data.id,
         },
         {
             $set: {
                 price: topping.data.price,
                 tenantId: topping.data.tenantId
             },
         },
         {
             upsert: true,
         },
        );
   } catch (error) {
        console.log(error)
   }
    
}