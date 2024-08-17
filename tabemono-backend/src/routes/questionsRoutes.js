const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');

router.get('/initial-categories', questionsController.getInitialCategories);
router.get('/food-options', questionsController.getFoodOptions);
router.post('/save-selection', questionsController.saveFoodSelection);

module.exports = router;