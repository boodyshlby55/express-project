import {NextFunction, Request, Response} from 'express';
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import ApiErrors from "../utils/apiErrors";
import Features from "../utils/features";
import {FilterData} from "../interfaces/filterData";
import {sanitizeUser} from "../utils/sanitization";

export const getAll = <modelType>(model: mongoose.Model<any>, modelName: string) => expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    let filterData: FilterData = {};
    let searchLength: number = 0;
    if (req.filterData) {
        filterData = req.filterData;
        const data: modelType[] = await model.find(filterData);
        searchLength = data.length;
    }
    
    if (req.query.search) {
        const searchResult: Features = new Features(model.find(filterData), req.query).search(modelName);
        const searchData: modelType[] = await searchResult.mongooseQuery;
        searchLength = searchData.length;
    }

    const documentCount: number = searchLength || await model.find(filterData).countDocuments();
    const apiFeatures: Features = new Features(model.find(filterData), req.query).filter().sort().limitFields().search(modelName).pagination(documentCount);
    const {mongooseQuery, paginationResult} = apiFeatures;
    const documents: modelType[] = await mongooseQuery;
    if (modelName === 'users') {
        const sanitizedUsers = documents.map(user => sanitizeUser(user));
        res.status(200).json({length: documents.length, pagination: paginationResult, data: sanitizedUsers});
    } else {
        res.status(200).json({length: documents.length, pagination: paginationResult, data: documents});
    }

});

export const getAllList = <modelType>(model: mongoose.Model<any>) => expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    let filterData: FilterData = {};
    let apiFeatures: Features;
    if (req.filterData) {
        filterData = req.filterData;
    }
    apiFeatures = new Features(model.find(filterData), req.query).filter().sort().limitFields();
    const {mongooseQuery} = apiFeatures;
    const documents: modelType[] = await mongooseQuery;
    res.status(200).json({results: documents.length, data: documents});
});

export const createOne = <modelType>(model: mongoose.Model<any>) => expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const document = await model.create(req.body);
    res.status(200).json({data: document});
});

export const getOne = <modelType>(model: mongoose.Model<any>) => expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const document = await model.findById(req.params.id);
    if (!document) {
        return next(new ApiErrors(`No document for this id`, 404));
    }
    res.status(200).json({data: document});
});

export const updateOne = <modelType>(model: mongoose.Model<any>) => expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const document = await model.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!document) {
        return next(new ApiErrors(`No document for this id`, 404));
    }
    res.status(200).json({data: document});
});

export const deleteOne = <modelType>(model: mongoose.Model<any>) => expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const document = await model.findByIdAndDelete(req.params.id);
    if (!document) {
        return next(new ApiErrors(`No document for this id`, 404));
    }
    res.status(204).json({status: "success"});
});