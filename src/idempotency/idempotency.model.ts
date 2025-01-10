import mongoose from "mongoose";

const idempotencySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    response: {
        type: Object,
        required: true,
    }
},{timestamps: true});

// idempotencySchema.index({createdAt: 1}, {expireAfterSeconds: 60 * 60 * 48});
idempotencySchema.index({createdAt: 1}, {expireAfterSeconds: 20});
idempotencySchema.index({key: 1}, {unique: true});
export default mongoose.model("Idempotency", idempotencySchema);