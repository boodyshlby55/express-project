import {Request, Response, NextFunction} from 'express'
import expressAsyncHandler from "express-async-handler";
import Jwt from 'jsonwebtoken';
import crypto from "crypto";
import bcrypt from "bcryptjs";
import usersModel from "../models/usersModel";
import ApiErrors from "../utils/apiErrors";
import sendEmail from "../utils/sendEmail";
import {Users} from "../interfaces/users";
import {sanitizeUser} from "../utils/sanitization";
import {createResetToken, createToken} from "../utils/createToken";

export const checkEmail = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await usersModel.findOne({email: req.body.email});
    let message;
    if (user) {
        message = [{en: "Email is not available"}, {ar: "هذا البريد موجود بالفعل"}];
    } else {
        message = [{en: "Email is available"}, {ar: "متاح"}];
    }
    res.status(200).json({data: message});
});

export const signup = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user: Users = await usersModel.create(req.body);
    const token: string = createToken(user._id);
    res.status(201).json({token, user: sanitizeUser(user)});
});

export const login = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await usersModel.findOne({email: req.body.email});
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new ApiErrors('Invalid email or password', 401));
    }
    const token: string = createToken(user._id);
    res.status(200).json({token, user: sanitizeUser(user)});
});

export const forgetPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await usersModel.findOne({email: req.body.email});
    if (!user) {
        return next(new ApiErrors('no account with this email exist', 400));
    }
    const resetCode: string = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.passwordResetCodeExpires = Date.now() + (10 * 60 * 1000);
    user.passwordResetCodeVerify = false;
    const message: string = `Your Reset Password Code is "${resetCode}"`;
    try {
        await sendEmail({email: user.email, subject: 'Forget Password', message});
        await user.save({validateModifiedOnly: true});
    } catch (err: any) {
        console.log(err);
        return next(new ApiErrors('Error while sending reset code... try again later', 400));
    }
    const resetToken: string = createResetToken(user._id);
    res.status(200).json({msg: 'check your email', resetToken});
});

export const verifyResetPasswordCode = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let resetToken: string = '';
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        resetToken = req.headers.authorization.split(' ')[1]
    }
    if (resetToken === '') {
        return next(new ApiErrors("you don't have permission to verify reset code", 400));
    }
    const decodedToken: any = Jwt.verify(resetToken, process.env.JWT_RESET_SECRET_KEY!);
    const hashedResetCode: string = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
    const user = await usersModel.findOne({
        _id: decodedToken._id,
        passwordResetCode: hashedResetCode,
        passwordResetCodeExpires: {$gt: Date.now()}
    });
    if (!user) {
        return next(new ApiErrors('Invalid or expired reset code', 400))
    }
    user.passwordResetCodeVerify = true;
    await user.save({validateModifiedOnly: true});
    res.status(200).json({success: true});
});

export const resetPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let resetToken: string = '';
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        resetToken = req.headers.authorization.split(' ')[1];
    }
    if (resetToken === '') {
        return next(new ApiErrors('You do not have permission to verify reset code.', 400));
    }
    const decodedToken: any = Jwt.verify(resetToken, process.env.JWT_RESET_SECRET_KEY!);
    const user = await usersModel.findOne({_id: decodedToken._id, passwordResetCodeVerify: true});
    if (!user) {
        return next(new ApiErrors('Please verify your code first', 400));
    }
    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetCodeVerify = undefined;
    user.passwordChangedAt = Date.now();
    await user.save({validateModifiedOnly: true});
    res.status(200).json({success: true, data: "Password has been changed"});
});

export const protectRoutes = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string = ''; // * Check token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (token === '') {
        return next(new ApiErrors('You are not logged in! Please log in to get access.', 401));
    }
    const decoded: any = Jwt.verify(token, process.env.JWT_SECRET_KEY!);
    const expirationThreshold: number = 24 * 60 * 60;
    if (decoded.exp - Date.now() / 1000 < expirationThreshold) {
        try {
            req.newToken = createToken(decoded._id);
        } catch (error: any) {
            console.error('Error generating new token:', error);
            return next(new ApiErrors('Failed to refresh token.', 500));
        }
    }
    const user: any = sanitizeUser(await usersModel.findById(decoded._id));
    if (!user) {
        return next(new ApiErrors('The user does not exist anymore...', 404));
    }
    if (user.passwordChangedAt instanceof Date) {
        const changedPasswordTime: number = (user.passwordChangedAt.getTime() / 1000);
        if (changedPasswordTime > decoded.iat) {
            return next(new ApiErrors('Your password has been updated since you logged in last time. Please log in again.', 403));
        }
    }
    req.user = user;
    next();
});

export const refreshToken = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    let newToken: string = '';
    if (req.newToken) {
        newToken = req.newToken
    }
    console.log(`Token Refreshed to user ${req.user?.name}`);
    res.json({token: newToken})
});

export const allowedTo = (...roles: string[]) => expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!(roles.includes(req.user?.role ?? ''))) {
        return next(new ApiErrors(`Privilege denied! You cannot perform this action`, 403));
    }
    next();
});

export const checkActive = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.active) {
        return next(new ApiErrors("Your account is deactivated", 403));
    }
    next();
});