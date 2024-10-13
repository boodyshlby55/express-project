import {RequestHandler} from "express";
import {check} from 'express-validator';
import validatorMiddleware from "../global/middlewares/validator.middleware";
import usersModel from "../users/users.schema";

class AuthValidation {
    signup: RequestHandler[] = [
        check('name')
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_name')
        })
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => {
            return req.__('validation_name_length')
        }),
        check('email')
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_email')
        })
            .isEmail().withMessage((val, {req}) => {
            return req.__('validation_email_check')
        })
            .custom(async (value: string, {req}): Promise<boolean> => {
                const user = await usersModel.findOne({email: value});
                if (user) {
                    return Promise.reject(new Error(`${req.__('not_available')}`));
                }
                return true;
            }),
        check('password')
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_password')
        })
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => {
            return req.__('validation_password_length')
        })
            .custom((password: string, {req}): boolean => {
                if (password !== req.body.confirmPassword) {
                    throw new Error(`${req.__('validation_password_match')}`);
                }
                return true;
            }),
        check('confirmPassword')
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_passwordConfirmation')
        })
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => {
            return req.__('validation_passwordConfirmation_length')
        }),
        validatorMiddleware
    ];
    login: RequestHandler[] = [
        check('email')
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_email')
        })
            .isEmail().withMessage((val, {req}) => {
            return req.__('validation_email_check')
        }),
        check("password")
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_password')
        })
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => {
            return req.__('validation_password_length')
        }),
        validatorMiddleware,
    ];
    checkEmail: RequestHandler[] = [
        check('email')
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_email')
        })
            .isEmail().withMessage((val, {req}) => {
            return req.__('validation_email_check')
        }),
        validatorMiddleware,
    ];
    resetPassword: RequestHandler[] = [
        check("confirmPassword")
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_passwordConfirmation')
        })
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => {
            return req.__('validation_passwordConfirmation_length')
        }),
        check("password")
            .notEmpty().withMessage((val, {req}) => {
            return req.__('validation_password')
        })
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => {
            return req.__('validation_password_length')
        })
            .custom((val: string, {req}): boolean => {
                if (val !== req.body.confirmPassword) {
                    throw new Error(`${req.__('validation_password_match')}`);
                }
                return true;
            }),
        validatorMiddleware,
    ];
}

const authValidation = new AuthValidation();
export default authValidation;