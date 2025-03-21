
import express from 'express';
import * as addressController from '../controllers/addressController';
import violationRoutes from './violationRoutes';
import settingsRoutes from './settingsRoutes';

const router = express.Router();

// Address routes
router.get('/addresses', addressController.getAddresses);
router.post('/addresses', addressController.addAddress);
router.delete('/addresses/:index', addressController.deleteAddress);
router.post('/addresses/bulk', addressController.bulkImportAddresses);

// Violations routes - using the router from violationRoutes.ts
router.use('/violations', violationRoutes);

// Settings routes - using the router from settingsRoutes.ts
router.use('/settings', settingsRoutes);

export default router;
