import {FilterData} from "./filterData";

declare module 'express' {
    interface Request {
        filterData?: FilterData;
        user?: any;
        files?: any;
        newToken?: any;
    }
}
