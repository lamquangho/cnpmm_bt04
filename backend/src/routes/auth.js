const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot', controller.forgotPassword);
router.post('/reset', controller.resetPassword);

module.exports = router;
