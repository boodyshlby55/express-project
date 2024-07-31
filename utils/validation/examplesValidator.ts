import fs from "fs";
import {RequestHandler} from "express";
import {check} from 'express-validator';
import validatorMiddleware from "../../middlewares/validatorMiddleware";

export const createExampleValidator: RequestHandler[] = [
    check('name').notEmpty().withMessage('category name is required'),
    validatorMiddleware
];

export const getExampleValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage("invalid category id"),
    validatorMiddleware
];

export const updateExampleValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage("invalid category id"),
    check('name').notEmpty().withMessage("category name is required"),
    validatorMiddleware
];

export const deleteExampleValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage("invalid category id"),
    validatorMiddleware
];

export const deleteUploadedImage = (image: string): void => {
    const imagePath: string = `uploads/examples/${image}`;
    fs.unlink(imagePath, (err): void => {
        if (err) {
            console.error(`Error deleting image ${image}: ${err}`);
        } else {
            console.log(`Successfully deleted image ${image}`);
        }
    });
};

export const deleteUploadedImages = (images: string[]): void => {
    images.forEach((imageName: string): void => {
        const imagePath: string = `uploads/examples/${imageName}`;
        fs.unlink(imagePath, (err): void => {
            if (err) {
                console.error(`Error deleting image ${imageName}: ${err}`);
            } else {
                console.log(`Successfully deleted image ${imageName}`);
            }
        });
    });
};