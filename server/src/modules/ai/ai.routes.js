const express = require('express');
const { parseSearchQuery } = require('./ai.controller');

const router = express.Router();

router.post('/parse-search', parseSearchQuery);

module.exports = router;
