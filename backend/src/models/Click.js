const mongoose = require('mongoose');
const UAParser = require('ua-parser-js');
const crypto = require('crypto');

const clickSchema = new mongoose.Schema({
  url_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true, index: true },
  ip_address: { type: String, default: null },
  ip_hash: { type: String, default: null, index: true },
  user_agent: { type: String, default: null },
  browser: { type: String, default: 'Unknown' },
  os: { type: String, default: 'Unknown' },
  device_type: { type: String, default: 'desktop' },
  referrer: { type: String, default: null },
  clicked_at: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

clickSchema.statics.record = async function({ urlId, ipAddress, userAgent, referrer }) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const browser = result.browser.name || 'Unknown';
  const os = result.os.name || 'Unknown';
  const device_type = result.device.type || 'desktop';
  const ip_hash = crypto.createHash('sha256').update((ipAddress || '') + urlId).digest('hex');

  const click = new this({
    url_id: urlId,
    ip_address: ipAddress,
    ip_hash,
    user_agent: userAgent,
    browser,
    os,
    device_type,
    referrer: referrer || null,
  });
  await click.save();

  // Check if unique
  const prev = await this.countDocuments({ url_id: urlId, ip_hash, _id: { $ne: click._id } });
  return { id: click._id, ip_hash, isNew: prev === 0 };
};

clickSchema.statics.getByUrlId = function(urlId, limit = 100) {
  return this.find({ url_id: urlId })
    .sort({ clicked_at: -1 })
    .limit(limit)
    .select('browser os device_type referrer clicked_at ip_address')
    .lean();
};

clickSchema.statics.getAnalytics = async function(urlId) {
  const id = new mongoose.Types.ObjectId(urlId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [overview, byDevice, byBrowser, byReferrer, byDay, byHour] = await Promise.all([
    // Overview
    this.aggregate([
      { $match: { url_id: id } },
      { $group: {
        _id: null,
        total_clicks: { $sum: 1 },
        unique_clicks: { $addToSet: '$ip_hash' },
        first_click: { $min: '$clicked_at' },
        last_click: { $max: '$clicked_at' },
      }},
      { $project: {
        total_clicks: 1,
        unique_clicks: { $size: '$unique_clicks' },
        first_click: 1,
        last_click: 1,
      }},
    ]),

    // By device
    this.aggregate([
      { $match: { url_id: id } },
      { $group: { _id: '$device_type', count: { $sum: 1 } } },
      { $project: { device_type: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),

    // By browser
    this.aggregate([
      { $match: { url_id: id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $project: { browser: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // By referrer
    this.aggregate([
      { $match: { url_id: id } },
      { $group: { _id: { $ifNull: ['$referrer', 'Direct'] }, count: { $sum: 1 } } },
      { $project: { referrer: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // By day (last 30 days)
    this.aggregate([
      { $match: { url_id: id, clicked_at: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$clicked_at' } },
        clicks: { $sum: 1 },
        unique_ips: { $addToSet: '$ip_hash' },
      }},
      { $project: { date: '$_id', clicks: 1, unique_clicks: { $size: '$unique_ips' }, _id: 0 } },
      { $sort: { date: 1 } },
    ]),

    // By hour (last 7 days)
    this.aggregate([
      { $match: { url_id: id, clicked_at: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $hour: '$clicked_at' },
        clicks: { $sum: 1 },
      }},
      { $project: { hour: '$_id', clicks: 1, _id: 0 } },
      { $sort: { hour: 1 } },
    ]),
  ]);

  return {
    overview: overview[0] || { total_clicks: 0, unique_clicks: 0, first_click: null, last_click: null },
    byDevice,
    byBrowser,
    byReferrer,
    byDay,
    byHour,
  };
};

clickSchema.statics.getUserAnalytics = async function(userId) {
  const Url = mongoose.model('Url');
  const userUrls = await Url.find({ user_id: userId }).select('_id').lean();
  const urlIds = userUrls.map(u => u._id);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [clicksByDay, topUrls] = await Promise.all([
    this.aggregate([
      { $match: { url_id: { $in: urlIds }, clicked_at: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$clicked_at' } },
        clicks: { $sum: 1 },
      }},
      { $project: { date: '$_id', clicks: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]),
    Url.find({ user_id: userId })
      .sort({ click_count: -1 })
      .limit(5)
      .select('short_code custom_alias original_url title click_count unique_click_count')
      .lean(),
  ]);

  return { clicksByDay, topUrls };
};

module.exports = mongoose.model('Click', clickSchema);
