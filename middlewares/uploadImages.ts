import express from 'express';
import multer from 'multer';
import ApiErrors from '../utils/apiErrors';
import {ImageFields} from "../interfaces/uploadFields";

const uploadOptions = (): multer.Multer => {
    const multerStorage: multer.StorageEngine = multer.memoryStorage();
    const multerFilter = function (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new ApiErrors('the file not an image', 400))
        }

    };
    const upload: multer.Multer = multer({storage: multerStorage, fileFilter: multerFilter});
    return upload;
};

export const uploadSingleImage = (fieldName: string) => {
    return uploadOptions().single(fieldName);
};

export const uploadMultiImages = (fields: ImageFields[]) => {
    return uploadOptions().fields(fields);
};