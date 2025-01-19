import express from 'express';
import CouponController from './coupon.controler';
import { couponValidator } from './coupon.validator';
import CouponService from './coupon.service';
import logger from '../config/logger';
import { asyncWrapper } from '../utils';
import authenticate from '../common/middleware/authenticate';
import { canAccess } from '../common/middleware/canAccess';
import { ROLES } from '../constant';
import { couponVerifyValidator } from './couponVerify.validator';

const router = express.Router()

const couponService = new CouponService()
const couponController = new CouponController(couponService, logger);

router.post('/',authenticate,canAccess([ROLES.ADMIN,ROLES.MANAGER]),couponValidator,asyncWrapper(couponController.createCoupon));
router.get('/',authenticate, asyncWrapper(couponController.getAll));
router.delete('/:id',authenticate,canAccess([ROLES.ADMIN,ROLES.MANAGER]),asyncWrapper(couponController.deleteCoupon));
router.put('/:id',authenticate,canAccess([ROLES.ADMIN,ROLES.MANAGER]),couponValidator,asyncWrapper(couponController.updateCoupon));
router.post('/verify',authenticate, couponVerifyValidator,asyncWrapper(couponController.verifyCoupon));


export default router;