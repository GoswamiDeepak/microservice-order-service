import mongoose from "mongoose";

export interface ToppingPriceCache {
    _id: mongoose.Types.ObjectId;
    toppingId: string;
    price: number;
    tenantId: string;
}

const toppingCacheSchema = new mongoose.Schema({
    toppingId: {
        type: String,
        required: true,
    },
    price : {
        type: Number,
        required: true,
    },
    tenantId: {
        type: String,
        required: true,
    }
})
toppingCacheSchema.index({toppingId: 1}, {unique: true})
export default mongoose.model('ToppingCache', toppingCacheSchema, 'toppingCache')