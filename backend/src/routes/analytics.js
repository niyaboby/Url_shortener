const express = require('express');
const { getAnalytics } = require('../controllers/urlController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:urlId', auth, getAnalytics);

module.exports = router;
