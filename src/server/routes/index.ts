
import express from 'express';
import * as addressController from './addressRoutes';
import * as violationController from './violationRoutes';
import * as settingsController from './settingsRoutes';

const router = express.Router();

// Address routes
router.get('/addresses', addressController.getAddresses);
router.post('/addresses', addressController.addAddress);
router.delete('/addresses/:index', addressController.deleteAddress);
router.post('/addresses/bulk', addressController.bulkImportAddresses);

// Violations routes - fixed to use query parameters instead of route params
router.get('/violations/search', violationController.searchViolations);
router.post('/violations/search-multiple', violationController.searchMultipleAddresses);

// Settings routes
router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.updateSettings);

export default router;
