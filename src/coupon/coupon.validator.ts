import { body } from 'express-validator';

export const couponValidator = [
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Title is required'),
    
    body('code')
        .isString()
        .withMessage('Code must be a string')
        .notEmpty()
        .withMessage('Code is required'),
    
    body('discount')
        .isNumeric()
        .withMessage('Discount must be a number')
        .isFloat({ min: 0 })
        .withMessage('Discount must be a positive number'),
    
    body('validUpto')
        .isISO8601()
        .withMessage('ValidUpto must be a valid date')
        .toDate(),
    
    body('tenantId')
        .isInt()
        .withMessage('TenantId must be an integer')
        .notEmpty()
        .withMessage('TenantId is required')
];