const express = require('express');
const router = express.Router();
const helpersController = require('../controllers/helpers');

// GET all helpers
router.get('/', helpersController.getAllHelpers);

// PUT update helper details
router.put('/:id', helpersController.updateHelperDetails);

module.exports = router;
