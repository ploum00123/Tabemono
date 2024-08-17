const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/:id', userController.getUser);
router.post('/record-login', userController.recordUserLogin);

module.exports = router;