import mongoose from "mongoose";

const toppingCacheSchema = new mongoose.Schema({
    toppingId: {
        type: String,
        required: true,
    },
    toppingPrice : {
        type: Number,
        required: true,
    }
})
export default mongoose.model('ToppingCache', toppingCacheSchema, 'toppingCache')