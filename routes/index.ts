import * as all from '../interfaces'
import {Application, NextFunction, Request, Response} from "express";
import globalErrors from "../middlewares/globalErrors";
import ApiErrors from "../utils/apiErrors";
import examplesRoute from "./examplesRoute";
import usersRoute from "./usersRoute";
import authRoute from "./authRoute";

const mountRoutes = (app: Application): void => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.cookie('_coo_123', req.csrfToken());
        next();
    });
    app.use('/api/v1/examples', examplesRoute);
    app.use('/api/v1/users', usersRoute);
    app.use('/api/v1/auth', authRoute);
    app.all('*', (req: Request, res: Response, next: NextFunction) => {
        next(new ApiErrors(`The router ${req.originalUrl} is not found`, 400))
    });
    app.use(globalErrors);
};

export default mountRoutes;