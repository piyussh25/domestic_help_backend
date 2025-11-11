const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// POST /api/register
router.post('/register', authController.register);

// POST /api/login
router.post('/login', authController.login);

// POST /api/upload-profile-picture
router.post('/upload-profile-picture', authController.uploadProfilePicture);

module.exports = router;
