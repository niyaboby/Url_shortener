const QRCode = require('qrcode');
const { customAlphabet } = require('nanoid');
const Url = require('../models/Url');
const Click = require('../models/Click');
const { AppError } = require('../middleware/errorHandler');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 7);

class UrlService {
  static getShortUrl(code) {
    return `${process.env.BASE_URL}/${code}`;
  }

  static async generateQR(shortUrl) {
    return QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  }

  static async shorten({ userId, originalUrl, customAlias, title, expiresAt }) {
    try { new URL(originalUrl); } catch { throw new AppError('Invalid URL format', 400); }

    // BUG FIX: Normalize alias - empty string / whitespace treated as no alias
    const alias = customAlias && customAlias.trim() !== '' ? customAlias.trim() : undefined;

    if (alias) {
      if (!/^[a-zA-Z0-9_-]{3,50}$/.test(alias)) {
        throw new AppError('Alias must be 3-50 alphanumeric chars, hyphens, or underscores', 400);
      }
      if (await Url.checkAliasExists(alias)) throw new AppError('Alias already taken', 409);
    }

    let shortCode;
    let attempts = 0;
    do {
      shortCode = nanoid();
      if (++attempts > 10) throw new AppError('Failed to generate unique code', 500);
    } while (await Url.checkAliasExists(shortCode));

    // BUG FIX: Only include custom_alias in the document if it has a real value.
    // Never store null/empty string — the sparse index only skips fields that are absent.
    const docData = {
      user_id: userId,
      original_url: originalUrl,
      short_code: shortCode,
      title: title ? title.trim() : undefined,
      expires_at: expiresAt || undefined,
    };
    if (alias) docData.custom_alias = alias;

    const url = await Url.create(docData);

    const activeCode = url.custom_alias || url.short_code;
    const shortUrl = this.getShortUrl(activeCode);
    const qrCode = await this.generateQR(shortUrl);

    return {
      url: { ...url.toObject(), id: url._id.toString() },
      shortUrl,
      qrCode,
    };
  }

  static async resolve(code, { ipAddress, userAgent, referrer }) {
    const url = await Url.findByCode(code);
    if (!url) throw new AppError('Link not found', 404);
    if (!url.is_active) throw new AppError('Link is inactive', 410);
    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      throw new AppError('Link has expired', 410);
    }

    const clickData = await Click.record({ urlId: url._id, ipAddress, userAgent, referrer });
    await Url.incrementClick(url._id);
    if (clickData.isNew) await Url.incrementUniqueClick(url._id);

    return url.original_url;
  }

  static async getUserUrls(userId) {
    const urls = await Url.findByUserId(userId);
    return urls.map(url => ({
      ...url,
      id: url._id ? url._id.toString() : url.id,
      shortUrl: this.getShortUrl(url.custom_alias || url.short_code),
    }));
  }

  static async getUrlDetail(id, userId) {
    const url = await Url.findOne({ _id: id, user_id: userId }).lean();
    if (!url) throw new AppError('URL not found or forbidden', 404);

    const activeCode = url.custom_alias || url.short_code;
    const shortUrl = this.getShortUrl(activeCode);
    const qrCode = await this.generateQR(shortUrl);
    const analytics = await Click.getAnalytics(id);
    const recentClicks = await Click.getByUrlId(id, 50);

    return {
      url: {
        ...url,
        id: url._id.toString(),
        shortUrl,
        isExpired: url.expires_at ? new Date(url.expires_at) < new Date() : false,
      },
      qrCode,
      analytics,
      recentClicks,
    };
  }

  static async update(id, userId, data) {
    const url = await Url.findOne({ _id: id, user_id: userId });
    if (!url) throw new AppError('URL not found or forbidden', 404);

    // BUG FIX: Only check alias conflict if a real alias is being set
    const newAlias = data.customAlias && data.customAlias.trim() !== ''
      ? data.customAlias.trim()
      : undefined;

    if (newAlias && newAlias !== url.custom_alias) {
      if (await Url.checkAliasExists(newAlias)) throw new AppError('Alias already taken', 409);
    }

    const updates = {};
    if (data.title !== undefined) updates.title = data.title || null;
    if (data.expiresAt !== undefined) updates.expires_at = data.expiresAt || null;
    if (data.isActive !== undefined) updates.is_active = data.isActive;

    // BUG FIX: To remove an alias, use $unset. To set one, use the value.
    if (data.customAlias !== undefined) {
      if (newAlias) {
        updates.custom_alias = newAlias;
      } else {
        // Remove alias from document entirely so sparse index works correctly
        return Url.findByIdAndUpdate(id, { $set: updates, $unset: { custom_alias: '' } }, { new: true }).lean();
      }
    }

    return Url.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  }

  static async delete(id, userId) {
    const result = await Url.deleteOne({ _id: id, user_id: userId });
    if (result.deletedCount === 0) throw new AppError('URL not found or forbidden', 404);
    await Click.deleteMany({ url_id: id });
    return true;
  }
}

module.exports = UrlService;
