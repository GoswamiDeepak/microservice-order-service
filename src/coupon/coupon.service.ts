import { CouponModel, ICoupon } from "./coupon.model";

export default class CouponService {
    createCoupon = async (couponData: ICoupon) => {
        // create coupon logic
        return await CouponModel.create(couponData);
    }
}