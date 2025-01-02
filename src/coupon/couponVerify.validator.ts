import { body } from 'express-validator';

export const couponVerifyValidator = [
    body('code')
        .isString()
        .withMessage('Code must be a string')
        .notEmpty()
        .withMessage('Code is required'),   
    body('tenantId')
        .isInt()
        .withMessage('TenantId must be an integer')
        .notEmpty()
        .withMessage('TenantId is required')
];