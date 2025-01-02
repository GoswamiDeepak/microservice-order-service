import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import CouponService from "./coupon.service";
import { ICoupon } from "./coupon.model";

export default class CouponController {
    constructor(private couponService: CouponService, private logger: Logger) {}

    createCoupon = async (req:Request, res:Response, next: NextFunction) => {

        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg))
        }

        const { title, code, discount, validUpto, tenantId } = req.body;

        const couponData = {
            title,
            code,
            discount,
            validUpto,
            tenantId
        }

        const coupon = await this.couponService.createCoupon(couponData as ICoupon);
        this.logger.info(`Coupon created: ${coupon._id}`);
        res.status(201).json(coupon);

    }

    getAll = async (req:Request, res:Response) => {
        const coupons = await this.couponService.getAll();
        res.json(coupons)
    }
}