import {Router} from 'express';
import authService from "../controllers/auth";
import authValidator from "../utils/validation/authValidator";

const authRoute: Router = Router();

authRoute.route('/checkEmail').post(authValidator.checkEmail, authService.checkEmail);
authRoute.route('/signup').post(authValidator.signup, authService.signup);
authRoute.route('/login').post(authValidator.login, authService.login);
authRoute.route('/forgetPassword').post(authValidator.checkEmail, authService.forgetPassword);
authRoute.route('/verifyResetPasswordCode').post(authService.verifyResetPasswordCode);
authRoute.route('/resetPassword').put(authValidator.resetPassword, authService.resetPassword);
authRoute.route('/refreshToken').get(authService.protectRoutes, authService.refreshToken);

export default authRoute;