import {Request} from 'express';
import multer from 'multer';
import ApiErrors from '../utils/apiErrors';
import {ImageFields} from "../interfaces/uploadFields";

const uploadOptions = (): multer.Multer => {
    const multerStorage: multer.StorageEngine = multer.memoryStorage();
    const multerFilter = function (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new ApiErrors('the file not an image', 400))
        }

    };
    return multer({storage: multerStorage, fileFilter: multerFilter});
};

export const uploadSingleImage = (fieldName: string) => {
    return uploadOptions().single(fieldName);
};

export const uploadMultiImages = (fields: ImageFields[]) => {
    return uploadOptions().fields(fields);
};