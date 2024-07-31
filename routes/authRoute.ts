import {Router} from 'express';
import {
    checkEmail,
    forgetPassword,
    login,
    protectRoutes,
    refreshToken,
    resetPassword,
    signup,
    verifyResetPasswordCode
} from "../controllers/auth";
import {
    checkEmailValidator,
    loginValidator,
    resetPasswordValidator,
    signupValidator
} from "../utils/validation/authValidator";

const authRoute: Router = Router();

authRoute.route('/checkEmail').post(checkEmail);
authRoute.route('/signup').post(signupValidator, signup);
authRoute.route('/login').post(loginValidator, login);
authRoute.route('/forgetPassword').post(checkEmailValidator, forgetPassword);
authRoute.route('/verifyResetPasswordCode').post(verifyResetPasswordCode);
authRoute.route('/resetPassword').put(resetPasswordValidator, resetPassword);
authRoute.route('/refreshToken').get(protectRoutes, refreshToken);

export default authRoute;