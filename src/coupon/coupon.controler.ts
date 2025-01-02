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
        this.logger.info('Coupons fetched');
        res.json(coupons)
    }

    deleteCoupon = async (req:Request, res:Response) => {
        const { id } = req.params;
        await this.couponService.deleteCoupon(id);
        this.logger.info(`Coupon deleted: ${id}`);
        res.json({ message: 'Coupon deleted successfully' });
    }

    updateCoupon = async (req:Request, res:Response, next: NextFunction) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg))
        }
        const { id } = req.params;
        const { title, code, discount, validUpto, tenantId } = req.body;

        const couponData = {
            title,
            code,
            discount,
            validUpto,
            tenantId
        }

        const coupon = await this.couponService.updateCoupon(id, couponData as ICoupon);
        this.logger.info(`Coupon updated: ${id}`);
        res.json(coupon);
    }

    verifyCoupon = async (req:Request, res:Response, next: NextFunction) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg))
        }
        const { code, tenantId } = req.body;
        const coupon = await this.couponService.verifyCoupon(code, tenantId);
        if(!coupon) {
            return next(createHttpError(400, 'Coupon does not exisit!'));
        }

        //validate expiry
        const currentDate = new Date();
        const couponDate = new Date(coupon.validUpto);

        if(currentDate <= couponDate) {
            // return next(createHttpError(400, 'Coupon is expired!'));
            return res.json({valid: true, discount: coupon.discount});
        }

        res.json({valid: false, discount: 0});
    }
}