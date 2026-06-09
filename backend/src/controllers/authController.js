const AuthService = require('../services/authService');
const User = require('../models/User');

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await AuthService.signup({ name, email, password });
    res.status(201).json({ success: true, message: 'Account created', data: { user, token } });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login({ email, password });
    res.json({ success: true, message: 'Login successful', data: { user, token } });
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    // BUG FIX: req.user.id comes from JWT. findById handles string ObjectIds fine.
    const user = await User.findById(req.user.id).select('-password_hash').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user: { ...user, id: user._id.toString() } } });
  } catch (err) { next(err); }
};

module.exports = { signup, login, me };
