import {Request, Response, NextFunction} from 'express';
import expressAsyncHandler from "express-async-handler";
import sharp from "sharp";
import examplesModel from "../models/examplesModel";
import ApiErrors from "../utils/apiErrors";
import {Examples} from "../interfaces/examples";
import {FilterData} from "../interfaces/filterData";
import {createOne, deleteOne, getAll, getAllList, getOne, updateOne} from "./refactorHandler";
import {uploadMultiImages, uploadSingleImage} from "../middlewares/uploadImages";
import {deleteUploadedImage, deleteUploadedImages} from "../utils/validation/examplesValidator";

export const getExamples = getAll<Examples>(examplesModel, 'Examples');
export const getExamplesList = getAllList<Examples>(examplesModel);
export const getExample = getOne<Examples>(examplesModel);
export const createExample = createOne<Examples>(examplesModel);
export const updateExample = updateOne<Examples>(examplesModel);
export const deleteExample = deleteOne<Examples>(examplesModel);

export const filterExamples = (req: Request, res: Response, next: NextFunction): void => {
    let filterData: FilterData = {};
    filterData.name = 'web';
    req.filterData = filterData;
    next();
};

export const resizeImages = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.files) {
        if (req.files.cover) {
            const imageCoverFileName: string = `Example-${req.body.name_en}-${Date.now()}-cover.jpg`;
            await sharp(req.files.cover[0].buffer)
                .toFormat('jpg')
                .toFile(`uploads/Examples/${imageCoverFileName}`);
            req.body.cover = imageCoverFileName;
        }
        if (req.files.images) {
            req.body.images = [];
            await Promise.all(req.files.images.map(async (img: any, index: number): Promise<void> => {
                const imageName: string = `Example-${Date.now()}N${index + 1}.jpg`;
                await sharp(img.buffer)
                    .toFormat('jpg')
                    .toFile(`uploads/Examples/${imageName}`);
                req.body.images.push(imageName);
            }));
        }
    }
    next();
});
export const resizeImage = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.file) {
        const imageName = `Example-${Date.now()}.jpg`;
        const example = await examplesModel.findById(req.params.id);
        if (example?.cover) {
            const image: string = example.cover.split(`${process.env.BASE_URL}/Examples/`)[1]
            deleteUploadedImage(image)
        }
        await sharp(req.file.buffer)
            .toFormat('jpg')
            .toFile(`uploads/Examples/${imageName}`);
        req.body.image = imageName;
    }
    next();
});

export const ExampleImage = uploadSingleImage('cover')
export const ExampleImages = uploadMultiImages([{name: 'cover', maxCount: 1}, {name: 'images', maxCount: 5}]);

export const addImages = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const example = await examplesModel.findById(req.params.id);
    if (!example) {
        return next(new ApiErrors('no example for this Id', 404));
    }
    await examplesModel.findByIdAndUpdate(example._id, {$addToSet: {images: req.body.images}}, {new: true});
    res.status(200).json({data: example});
});
export const deleteImage = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const example = await examplesModel.findById(req.params.id);
    if (!example) {
        return next(new ApiErrors('no example for this Id', 404));
    }
    await examplesModel.findByIdAndUpdate(example._id, {$pull: {images: req.body.images}}, {new: true});
    const exampleImages: string[] = [];
    exampleImages.push(req.body.images);
    deleteUploadedImages(exampleImages);
    res.status(200).json({data: example});
});