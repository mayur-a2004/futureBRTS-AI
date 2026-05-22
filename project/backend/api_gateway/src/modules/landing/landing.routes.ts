// 👉 Ye file landing page ke routes define karti hai
// 👉 Isme logic controllers se connect kiya gaya hai

import express from 'express';
import { landingController } from './landing.controller';

const router = express.Router();

// 👉 Canonical API for landing page data
router.get('/page', landingController.getPageData);

// 👉 Intent aur Tracking APIs
router.post('/intent', landingController.saveIntent);
router.get('/config/:key', landingController.getConfig); // Public Config Fetch
router.post('/visit', landingController.trackVisit);

export default router;
