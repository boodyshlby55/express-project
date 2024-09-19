import Jwt from 'jsonwebtoken';

const createToken = (payload: any, role: string): string => {
    return Jwt.sign({_id: payload, role}, process.env.JWT_SECRET_KEY!, {expiresIn: process.env.EXPIRED_TIME});
};
const createResetToken = (payload: any): string => {
    return Jwt.sign({_id: payload}, process.env.JWT_RESET_SECRET_KEY!, {expiresIn: process.env.EXPIRED_RESET_TIME});
};
export {createToken, createResetToken};