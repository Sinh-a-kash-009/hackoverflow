const express = require('express');
const recordRouter = express.Router();
const recordController = require('../controller/recordcontroller');
const {protectRoute} = require('../middleware/authmiddleware');

recordRouter.post('/create',protectRoute,recordController.createRecord);
recordRouter.get('/get',protectRoute,recordController.getRecords);
recordRouter.get('/community-trends',protectRoute,recordController.getCommunityTrends);
recordRouter.get('/location-trends',protectRoute,recordController.getLocationTrends);
recordRouter.get('/health-comparison',protectRoute,recordController.getHealthComparison);
recordRouter.get('/weekly-trends',protectRoute,recordController.getWeeklyTrends);
module.exports = recordRouter;
