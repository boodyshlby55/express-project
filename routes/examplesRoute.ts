import {Router} from 'express';
import examplesService from "../controllers/example";
import examplesValidator from "../utils/validation/examplesValidator";

const examplesRoute: Router = Router();

examplesRoute.route('/')
    .get(examplesService.filterExamples, examplesService.getExamples)
    .post(examplesValidator.createExample, examplesService.createExample);

examplesRoute.get('/list', examplesService.getExamplesList);

examplesRoute.route('/:id')
    .get(examplesValidator.getExample, examplesService.getExample)
    .put(examplesValidator.updateExample, examplesService.updateExample)
    .delete(examplesValidator.deleteExample, examplesService.deleteExample);

export default examplesRoute;