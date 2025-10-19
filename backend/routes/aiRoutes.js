const express = require('express');
const aiRouter = express.Router();
const aiController = require('../controller/aicontroller');
const {protectRoute} = require('../middleware/authmiddleware');

aiRouter.post('/analyze',protectRoute,aiController.analyzeSymptoms);
module.exports = aiRouter;