import express from 'express';
import {validationResult} from 'express-validator';

const validatorMiddleware: express.RequestHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    } else {
        next();
    }
};

export default validatorMiddleware;