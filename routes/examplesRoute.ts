import {Router} from 'express';
import {
    createExample,
    deleteExample,
    filterExamples,
    getExamples,
    getExamplesList,
    getExample,
    updateExample
} from "../controllers/example";
import {
    createExampleValidator,
    deleteExampleValidator,
    getExampleValidator,
    updateExampleValidator
} from "../utils/validation/examplesValidator";

const examplesRoute: Router = Router();

examplesRoute.route('/')
    .get(filterExamples, getExamples)
    .post(createExampleValidator, createExample);

examplesRoute.get('/list', getExamplesList);

examplesRoute.route('/:id')
    .get(getExampleValidator, getExample)
    .put(updateExampleValidator, updateExample)
    .delete(deleteExampleValidator, deleteExample);

export default examplesRoute;