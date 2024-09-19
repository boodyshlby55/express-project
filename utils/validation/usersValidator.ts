import fs from "fs";
import {RequestHandler} from "express";
import {check} from "express-validator";
import bcrypt from 'bcryptjs';
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import usersModel from "../../models/usersModel";

export const createUserValidator: RequestHandler[] = [
    check('name')
        .notEmpty().withMessage((val, {req}) => req.__('validation_name'))
        .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_name_length')),
    check('email')
        .notEmpty().withMessage((val, {req}) => req.__('validation_email'))
        .isEmail().withMessage((val, {req}) => req.__('validation_email_check'))
        .custom(async (val: string) => {
            const user = await usersModel.findOne({email: val});
            if (user) {
                throw new Error('Email is already exist')
            }
            return true;
        }),
    check('password')
        .notEmpty().withMessage((val, {req}) => req.__('validation_password'))
        .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_password_length'))
        .custom((val: string, {req}) => {
            if (val !== req.body.confirmPassword) {
                throw new Error(req.__('validation_password_match'))
            }
            return true;
        }),
    check('confirmPassword')
        .notEmpty().withMessage((val, {req}) => req.__('validation_passwordConfirmation'))
        .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_passwordConfirmation_length')),
    validatorMiddleware
];
export const getUserValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
    validatorMiddleware
];
export const updateUserValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
    check('name').optional()
        .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_name_length')),
    check('active').optional().isBoolean().withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
];
export const changeUserPasswordValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
    check('password')
        .notEmpty().withMessage((val, {req}) => req.__('validation_password'))
        .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_password_length'))
        .custom((val: string, {req}) => {
            if (val !== req.body.confirmPassword) {
                throw new Error(req.__('validation_password_match'))
            }
            return true;
        }),
    check('confirmPassword')
        .notEmpty().withMessage((val, {req}) => req.__('validation_passwordConfirmation'))
        .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_passwordConfirmation_length')),
    validatorMiddleware
];
export const updateLoggedUserValidator: RequestHandler[] = [
    check('name').optional().isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_name_length')),
    validatorMiddleware
];
export const changeLoggedUserPasswordValidator: RequestHandler[] = [
    check('currentPassword')
        .notEmpty().withMessage((val, {req}) => req.__('validation_currentPassword'))
        .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_currentPassword_length'))
        .custom(async (val: string, {req}) => {
            const user = await usersModel.findById(req.user._id);
            const isValidPassword: boolean = await bcrypt.compare(val, user!.password);
            if (!isValidPassword) {
                throw new Error(req.__('validation_currentPassword_check'))
            }
            return true;
        }),
    check('password')
        .notEmpty().withMessage((val, {req}) => req.__('validation_password'))
        .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_password_length'))
        .custom((val: string, {req}) => {
            if (val !== req.body.confirmPassword) {
                throw new Error(req.__('validation_password_match'))
            }
            return true;
        }),
    check('confirmPassword')
        .notEmpty().withMessage((val, {req}) => req.__('validation_passwordConfirmation'))
        .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_passwordConfirmation_length')),
    validatorMiddleware
];
export const deleteUserValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
    validatorMiddleware
];

export const deleteUserImage = (image: string): void => {
    const imagePath: string = `uploads/images/users/${image}`;
    fs.unlink(imagePath, (err): void => {
        if (err) {
            console.error(`Error deleting image ${image}: ${err}`);
        } else {
            console.log(`Successfully deleted image ${image}`);
        }
    });
};