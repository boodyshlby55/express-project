import {RequestHandler} from "express";
import {check} from 'express-validator';
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import usersModel from "../../models/usersModel";

export const signupValidator: RequestHandler[] = [
    check('name')
        .notEmpty().withMessage("name is required")
        .isLength({min: 2, max: 50}).withMessage("name length must be between 2 and 50"),
    check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email')
        .custom(async (value: string): Promise<boolean> => {
            const user = await usersModel.findOne({email: value});
            if (user) {
                return Promise.reject(new Error('email already exists'));
            }
            return true;
        }),
    check('password')
        .notEmpty().withMessage('password is required')
        .isLength({min: 6, max: 20}).withMessage('password must be between 6 and 20')
        .custom((password: string, {req}): boolean => {
            if (password !== req.body.passwordConfirmation) {
                throw new Error("password don't match");
            }
            return true;
        }),
    check('passwordConfirmation')
        .notEmpty().withMessage('password confirmation is required')
        .isLength({min: 6, max: 20}).withMessage('password confirmation must be between 6 and 20'),
    validatorMiddleware
];

export const loginValidator: RequestHandler[] = [
    check('email').notEmpty().withMessage('email is Required').isEmail().withMessage('invalid email'),
    check("password")
        .notEmpty().withMessage('password is required')
        .isLength({min: 6, max: 20}).withMessage('Password should be between 6 and 14'),
    validatorMiddleware,
];

export const checkEmailValidator: RequestHandler[] = [
    check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    validatorMiddleware,
];

export const resetPasswordValidator: RequestHandler[] = [
    check("confirmNewPassword")
        .notEmpty().withMessage("You Must Enter New Password Confirmation")
        .isLength({min: 6, max: 20}).withMessage("Password Confirmation must be at least 6 char and at most 20 char"),
    check("newPassword")
        .notEmpty().withMessage("You Must Enter New Password")
        .isLength({min: 6, max: 20}).withMessage("Password Confirmation must be at least 6 char and at most 20 char")
        .custom(async (val: string, {req}): Promise<boolean> => {
            if (val !== req.body.confirmNewPassword) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
    validatorMiddleware,
];