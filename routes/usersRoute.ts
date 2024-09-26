import {Router} from 'express';
import usersService from '../controllers/users';
import usersValidator from '../utils/validation/usersValidator';
import authService from '../controllers/auth';

const usersRoute: Router = Router();

usersRoute.use(authService.protectRoutes, authService.checkActive);
usersRoute.route('/me')
    .get(usersService.setUserId, usersService.getUser)
    .put(usersService.setUserId, usersService.uploadUserImage, usersService.resizeUserImage, usersValidator.updateLoggedUser, usersService.updateLoggedUser)
    .delete(authService.allowedTo('user'), usersService.setUserId, usersValidator.deleteUser, usersService.deleteUser)
usersRoute.put('/changeMyPassword', usersValidator.changeLoggedUserPassword, usersService.changeLoggedUserPassword);

usersRoute.use(authService.allowedTo('manager'));
usersRoute.route('/')
    .get(usersService.getAllUsers)
    .post(usersService.uploadUserImage, usersService.resizeUserImage, usersValidator.createUser, usersService.createUser);
usersRoute.route('/:id')
    .get(usersValidator.getUser, usersService.getUser)
    .put(usersService.uploadUserImage, usersService.resizeUserImage, usersValidator.updateUser, usersService.updateUser)
    .delete(usersValidator.deleteUser, usersService.deleteUser);
usersRoute.put('/:id/changePassword', usersValidator.changeUserPassword, usersService.changeUserPassword);

export default usersRoute;