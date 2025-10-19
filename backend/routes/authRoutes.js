const express = require('express');
const authRouter = express.Router();
const authController = require('../controller/authcontroller');
const {protectRoute} = require('../middleware/authmiddleware');

authRouter.post('/login',authController.login);
authRouter.post('/register',authController.register);
authRouter.get('/logout',protectRoute,authController.logout);
authRouter.get('/delete',protectRoute,authController.deleteUser);
module.exports = authRouter;