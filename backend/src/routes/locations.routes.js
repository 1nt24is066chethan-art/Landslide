const express = require('express');
const router = express.Router();

const locationsController = require('../controllers/locationsController');
const riskController = require('../controllers/riskController');
const environmentController = require('../controllers/environmentController');
const vulnerableInfrastructureController = require('../controllers/vulnerableInfrastructureController');

// /search must be registered before /:id, otherwise Express would try
// to treat "search" as an :id value.
router.get('/search', locationsController.searchLocations);

router.get('/', locationsController.getLocations);
router.get('/:id', locationsController.getLocationById);
router.get('/:id/risk', riskController.getRiskForLocation);
router.get('/:id/environment', environmentController.getEnvironmentForLocation);
router.get('/:id/vulnerable-roads', vulnerableInfrastructureController.getVulnerableRoadsForLocation);
router.get('/:id/vulnerable-villages', vulnerableInfrastructureController.getVulnerableVillagesForLocation);

module.exports = router;