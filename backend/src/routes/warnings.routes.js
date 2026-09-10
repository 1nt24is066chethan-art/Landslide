const express = require('express');
const router = express.Router();

const warningsController = require('../controllers/warningsController');

router.get('/', warningsController.getWarnings);
router.get('/:id', warningsController.getWarningById);
router.patch('/:id/status', warningsController.updateWarningStatus);

module.exports = router;
