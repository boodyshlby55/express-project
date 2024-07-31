import {Document} from "mongoose";

export interface Users extends Document {
    email: string;
    password: string;
    name: string;
    active: boolean;
    passwordChangedAt: Date | number;
    passwordResetCode: string | undefined;
    passwordResetCodeExpires: Date | number | undefined;
    passwordResetCodeVerify: boolean | undefined;
    image: string;
}