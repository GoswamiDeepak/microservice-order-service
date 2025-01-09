import { ToppingMessage } from "../types";
import topppingCacheModel from "./topppingCacheModel";

export async function handleToppingUpdate(message: string) {
    //wrap this parsing in try catch

   try {
     const topping: ToppingMessage = JSON.parse(message);
     return await topppingCacheModel.updateOne(
         {
             toppingId: topping.id,
         },
         {
             $set: {
                 toppingPrice: topping.price,
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