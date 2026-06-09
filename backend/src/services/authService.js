const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

class AuthService {
  static generateToken(user) {
    return jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static async signup({ name, email, password }) {
    // BUG FIX: Use findByEmail static (consistent casing) 
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) throw new AppError('Email already registered', 409);

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password_hash });
    const token = this.generateToken(user);
    return {
      user: { id: user._id.toString(), name: user.name, email: user.email },
      token,
    };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    // BUG FIX: Ensure id is a plain string, not an ObjectId (causes JSON issues in some clients)
    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
    const token = this.generateToken(safeUser);
    return { user: safeUser, token };
  }
}

module.exports = AuthService;
