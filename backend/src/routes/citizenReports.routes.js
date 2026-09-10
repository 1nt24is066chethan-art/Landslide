const express = require('express');
const router = express.Router();

const citizenReportsController = require('../controllers/citizenReportsController');

router.get('/', citizenReportsController.getCitizenReports);
router.post('/', citizenReportsController.createCitizenReport);
router.get('/:id', citizenReportsController.getCitizenReportById);
router.patch('/:id/status', citizenReportsController.updateCitizenReportStatus);

module.exports = router;
