import {NextFunction, Request, Response} from 'express';
import expressAsyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import usersModel from "../models/usersModel";
import {Users} from "../interfaces/users";
import refactorHandler from "./refactorHandler";
import {uploadSingleImage} from '../middlewares/uploadImages';
import usersValidator from "../utils/validation/usersValidator";
import tokens from '../utils/createToken';

class UserService {
    uploadUserImage = uploadSingleImage('image');
    resizeUserImage = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (req.file) {
            const imgName = `user-${Date.now()}.png`
            await sharp(req.file.buffer)
                .toFormat('png')
                .png({quality: 95})
                .toFile(`uploads/images/users/${imgName}`)
            req.body.image = imgName;
            const user = await usersModel.findById(req.params.id);
            if (user && user.image) {
                usersValidator.deleteUserImage(user.image);
            }
        }
        next();
    });

    getAllUsers = refactorHandler.getAll<Users>(usersModel, 'users');
    createUser = refactorHandler.createOne<Users>(usersModel);
    getUser = refactorHandler.getOne<Users>(usersModel);
    deleteUser = refactorHandler.deleteOne<Users>(usersModel)
    updateUser = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await usersModel.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            image: req.body.image,
            active: req.body.active
        }, {new: true})
        res.status(200).json({data: user});
    });
    changeUserPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await usersModel.findByIdAndUpdate(req.params.id, {
            password: await bcrypt.hash(req.body.password, 13),
            passwordChangedAt: Date.now()
        }, {new: true})
        res.status(200).json({data: user});
    });

    setUserId = (req: Request, res: Response, next: NextFunction) => {
        req.params.id = req.user._id.toString()
        next();
    };
    updateLoggedUser = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await usersModel.findByIdAndUpdate(req.user?._id, {
            name: req.body.name,
            image: req.body.image,
        }, {new: true})
        res.status(200).json({data: user});
    });
    changeLoggedUserPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await usersModel.findByIdAndUpdate(req.user?._id, {
            password: await bcrypt.hash(req.body.password, 13),
            passwordChangedAt: Date.now()
        }, {new: true})
        const token = tokens.createToken(user?._id, user?.role!)
        res.status(200).json({token, data: user});
    });
}

const usersService = new UserService();
export default usersService;