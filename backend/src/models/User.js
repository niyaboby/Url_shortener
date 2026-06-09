const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
}, { timestamps: true });

// BUG FIX: Removed duplicate index call - unique: true on the field already creates one.
// Having both causes a harmless but confusing duplicate index warning.

userSchema.statics.findByEmail = async function (email) {
  return this.findOne({ email: email.toLowerCase().trim() }).lean();
};

userSchema.statics.findById_ = async function (id) {
  return this.findById(id).select('-password_hash').lean();
};

userSchema.statics.verifyPassword = async function (plain, hash) {
  return bcrypt.compare(plain, hash);
};

module.exports = mongoose.model('User', userSchema);
