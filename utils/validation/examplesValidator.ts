import fs from "fs";
import {RequestHandler} from "express";
import {check} from 'express-validator';
import validatorMiddleware from "../../middlewares/validatorMiddleware";

class ExamplesValidator {
    createExample: RequestHandler[] = [
        check('name').notEmpty().withMessage((val, {req}) => req.__('validation_name')),
        validatorMiddleware
    ];
    getExample: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        validatorMiddleware
    ];
    updateExample: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        check('name').notEmpty().withMessage((val, {req}) => req.__('validation_name')),
        validatorMiddleware
    ];
    deleteExample: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        validatorMiddleware
    ];
    deleteUploadedImage = (image: string): void => {
        const imagePath: string = `uploads/images/examples/${image}`;
        fs.unlink(imagePath, (err): void => {
            if (err) {
                console.error(`Error deleting image ${image}: ${err}`);
            } else {
                console.log(`Successfully deleted image ${image}`);
            }
        });
    };
    deleteUploadedImages = (images: string[]): void => {
        images.forEach((imageName: string): void => {
            const imagePath: string = `uploads/images/examples/${imageName}`;
            fs.unlink(imagePath, (err): void => {
                if (err) {
                    console.error(`Error deleting image ${imageName}: ${err}`);
                } else {
                    console.log(`Successfully deleted image ${imageName}`);
                }
            });
        });
    };
}

const examplesValidator = new ExamplesValidator();
export default examplesValidator;