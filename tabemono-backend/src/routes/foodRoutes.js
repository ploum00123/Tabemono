const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

router.get('/initial-categories', foodController.getInitialCategories);
router.get('/food-options', foodController.getFoodOptions);
router.get('/filtered-results', foodController.getFilteredResults);
router.post('/record-selection', foodController.recordFoodSelection);
router.post('/increment-view', foodController.incrementFoodView);
router.get('/statistics', foodController.getStatistics);

module.exports = router;