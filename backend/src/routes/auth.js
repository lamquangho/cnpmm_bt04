const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot', controller.forgotPassword);
router.post('/reset', controller.resetPassword);

// Test route để check authentication
router.get('/profile', auth, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = router;
