import {NextFunction, Request, Response} from 'express';
import expressAsyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import usersModel from "../models/usersModel";
import {Users} from "../interfaces/users";
import {createOne, deleteOne, getAll, getOne} from "./refactorHandler";
import {uploadSingleImage} from '../middlewares/uploadImages';
import {deleteUserImage} from "../utils/validation/usersValidator";
import {createToken} from '../utils/createToken';

export const uploadUserImage = uploadSingleImage('image');
export const resizeUserImage = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
        const imgName = `user-${Date.now()}.png`
        await sharp(req.file.buffer)
            .toFormat('png')
            .png({quality: 95})
            .toFile(`uploads/images/users/${imgName}`)
        req.body.image = imgName;
        const user = await usersModel.findById(req.params.id);
        if (user && user.image) {
            deleteUserImage(user.image);
        }
    }
    next();
});

export const getAllUsers = getAll<Users>(usersModel, 'users');
export const createUser = createOne<Users>(usersModel);
export const getUser = getOne<Users>(usersModel);
export const deleteUser = deleteOne<Users>(usersModel)
export const updateUser = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await usersModel.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        image: req.body.image,
        active: req.body.active
    }, {new: true})
    res.status(200).json({data: user});
});
export const changeUserPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await usersModel.findByIdAndUpdate(req.params.id, {
        password: await bcrypt.hash(req.body.password, 13),
        passwordChangedAt: Date.now()
    }, {new: true})
    res.status(200).json({data: user});
});

export const setUserId = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?._id) {
        req.params.id = req.user._id.toString()
    }
    next();
};
export const updateLoggedUser = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await usersModel.findByIdAndUpdate(req.user?._id, {
        name: req.body.name,
        image: req.body.image,
    }, {new: true})
    res.status(200).json({data: user});
});
export const changeLoggedUserPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await usersModel.findByIdAndUpdate(req.user?._id, {
        password: await bcrypt.hash(req.body.password, 13),
        passwordChangedAt: Date.now()
    }, {new: true})
    const token = createToken(user?._id, user?.role!)
    res.status(200).json({token, data: user});
});