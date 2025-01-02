import { CouponModel, ICoupon } from "./coupon.model";

export default class CouponService {
    createCoupon = async (couponData: ICoupon) => {
        // create coupon logic
        return await CouponModel.create(couponData);
    }
    getAll = async () => {
        return await CouponModel.find({});
    }

    deleteCoupon = async (id: string) => {
        return await CouponModel.findByIdAndDelete(id);
    }
    updateCoupon = async (id: string, couponData: ICoupon) => {
        return await CouponModel.findByIdAndUpdate(id, { $set: couponData }, { new: true });
    }
}