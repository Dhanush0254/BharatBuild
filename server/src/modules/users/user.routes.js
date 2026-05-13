const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { updateProfileSchema } = require('./user.validation');

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

module.exports = router;
