import express from 'express';
import CouponController from './coupon.controler';
import { couponValidator } from './coupon.validator';
import CouponService from './coupon.service';
import logger from '../config/logger';
import { asyncWrapper } from '../utils';

const router = express.Router()
const couponService = new CouponService()

const couponController = new CouponController(couponService, logger);

router.post('/',couponValidator,asyncWrapper(couponController.createCoupon));

export default router;