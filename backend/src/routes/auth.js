const express = require('express');
const { body } = require('express-validator');
const { signup, login, me } = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 chars'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  ],
  validate,
  signup
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  login
);

router.get('/me', auth, me);

module.exports = router;
