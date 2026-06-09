const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  original_url: { type: String, required: true },
  short_code: { type: String, required: true, unique: true, index: true },
  // BUG FIX: custom_alias must NOT have default: null or default: undefined.
  // Sparse index only ignores documents where the field is completely absent (not stored).
  // Setting default: null stores null, which counts as a value and causes duplicate key errors.
  custom_alias: { type: String },
  title: { type: String, default: null, maxlength: 255 },
  is_active: { type: Boolean, default: true },
  click_count: { type: Number, default: 0 },
  unique_click_count: { type: Number, default: 0 },
  expires_at: { type: Date, default: null },
}, { timestamps: true });

// BUG FIX: sparse: true means docs without custom_alias are excluded from the index.
// This prevents duplicate key errors when multiple URLs have no alias.
urlSchema.index({ custom_alias: 1 }, { unique: true, sparse: true });

urlSchema.virtual('isExpired').get(function () {
  if (!this.expires_at) return false;
  return new Date(this.expires_at) < new Date();
});

urlSchema.set('toJSON', { virtuals: true });
urlSchema.set('toObject', { virtuals: true });

urlSchema.statics.findByCode = function (code) {
  return this.findOne({ $or: [{ short_code: code }, { custom_alias: code }] }).lean();
};

urlSchema.statics.findByUserId = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urls = await this.find({ user_id: userId }).sort({ createdAt: -1 }).lean();

  const Click = mongoose.model('Click');
  const todayCounts = await Click.aggregate([
    { $match: { url_id: { $in: urls.map(u => u._id) }, clicked_at: { $gte: today } } },
    { $group: { _id: '$url_id', count: { $sum: 1 } } },
  ]);
  const todayMap = Object.fromEntries(todayCounts.map(t => [t._id.toString(), t.count]));

  return urls.map(u => ({
    ...u,
    id: u._id.toString(),
    today_clicks: todayMap[u._id.toString()] || 0,
    isExpired: u.expires_at ? new Date(u.expires_at) < new Date() : false,
  }));
};

urlSchema.statics.checkAliasExists = async function (alias) {
  if (!alias) return false;
  const count = await this.countDocuments({ $or: [{ custom_alias: alias }, { short_code: alias }] });
  return count > 0;
};

urlSchema.statics.incrementClick = function (id) {
  return this.findByIdAndUpdate(id, { $inc: { click_count: 1 } });
};

urlSchema.statics.incrementUniqueClick = function (id) {
  return this.findByIdAndUpdate(id, { $inc: { unique_click_count: 1 } });
};

module.exports = mongoose.model('Url', urlSchema);
