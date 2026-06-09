const express = require('express');
const { body } = require('express-validator');
const {
  shorten, getUserUrls, getUrlDetail,
  updateUrl, deleteUrl, getDashboardAnalytics, generateQR,
} = require('../controllers/urlController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/shorten',
  auth,
  [
    body('originalUrl')
  .notEmpty().withMessage('URL is required')
  .custom(v => {
    try { new URL(v.trim()); return true; } catch { throw new Error('Valid URL required (must include https://)'); }
    }),
    body('customAlias').optional().matches(/^[a-zA-Z0-9_-]{3,50}$/).withMessage('Invalid alias'),
    body('title').optional().isLength({ max: 255 }),
    body('expiresAt').optional({ nullable: true }).isISO8601().withMessage('Invalid date'),
  ],
  validate,
  shorten
);

router.get('/user/all', auth, getUserUrls);
router.get('/user/analytics', auth, getDashboardAnalytics);
router.get('/qr', auth, generateQR);
router.get('/:id', auth, getUrlDetail);
router.put('/:id', auth, updateUrl);
router.delete('/:id', auth, deleteUrl);

module.exports = router;
