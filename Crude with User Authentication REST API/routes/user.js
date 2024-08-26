const express = require('express');


const authValidation = require('../validators/user');
const authController = require('../controllers/auth');


const router = express.Router();

router.post('/signup', authValidation.signup,authController.signup);

router.post('/login',authValidation.login, authController.login);


module.exports = router;