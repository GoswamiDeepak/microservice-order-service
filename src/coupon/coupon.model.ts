
import mongoose, { Schema, Document } from 'mongoose';



interface ICoupon extends Document {
    title: string;
    code: string;
    discount: number;
    validUpto: Date;
    tenantId: number;
}

const CouponSchema: Schema = new Schema({
    title: { type: String, required: true },
    code: { type: String, required: true },
    discount: { type: Number, required: true },
    validUpto: { type: Date, required: true },
    tenantId: { type: Number, required: true },
});

CouponSchema.index({ code: 1, tenantId: 1 }, { unique: true });

const CouponModel = mongoose.model<ICoupon>('Coupon', CouponSchema);

export { ICoupon, CouponModel };