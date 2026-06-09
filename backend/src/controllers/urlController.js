const UrlService = require('../services/urlService');
const Click = require('../models/Click');

const shorten = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, title, expiresAt } = req.body;
    // BUG FIX: Normalize empty alias to undefined before passing to service
    const cleanAlias = customAlias && customAlias.trim() !== '' ? customAlias.trim() : undefined;

    const result = await UrlService.shorten({
      userId: req.user.id,
      originalUrl,
      customAlias: cleanAlias,
      title,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const redirect = async (req, res, next) => {
  try {
    const { code } = req.params;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
      || req.socket.remoteAddress
      || '0.0.0.0';
    const originalUrl = await UrlService.resolve(code, {
      ipAddress: ip,
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers['referer'] || '',
    });
    res.redirect(302, originalUrl);
  } catch (err) {
    if (err.statusCode === 410) return res.redirect(`${process.env.FRONTEND_URL}/expired`);
    if (err.statusCode === 404) return res.redirect(`${process.env.FRONTEND_URL}/not-found`);
    next(err);
  }
};

const getUserUrls = async (req, res, next) => {
  try {
    const urls = await UrlService.getUserUrls(req.user.id);
    res.json({ success: true, data: { urls } });
  } catch (err) { next(err); }
};

const getUrlDetail = async (req, res, next) => {
  try {
    const data = await UrlService.getUrlDetail(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const updateUrl = async (req, res, next) => {
  try {
    const { title, customAlias, expiresAt, isActive } = req.body;
    const cleanAlias = customAlias && customAlias.trim() !== '' ? customAlias.trim() : undefined;

    const url = await UrlService.update(req.params.id, req.user.id, {
      title,
      customAlias: cleanAlias,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive,
    });
    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
};

const deleteUrl = async (req, res, next) => {
  try {
    await UrlService.delete(req.params.id, req.user.id);
    res.json({ success: true, message: 'URL deleted' });
  } catch (err) { next(err); }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Click.getAnalytics(req.params.urlId);
    res.json({ success: true, data: { analytics } });
  } catch (err) { next(err); }
};

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const analytics = await Click.getUserAnalytics(req.user.id);
    res.json({ success: true, data: { analytics } });
  } catch (err) { next(err); }
};

const generateQR = async (req, res, next) => {
  try {
    const QRCode = require('qrcode');
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });
    const qr = await QRCode.toDataURL(url, { width: 300, margin: 2, errorCorrectionLevel: 'M' });
    res.json({ success: true, data: { qrCode: qr } });
  } catch (err) { next(err); }
};

module.exports = {
  shorten, redirect, getUserUrls, getUrlDetail, updateUrl,
  deleteUrl, getAnalytics, getDashboardAnalytics, generateQR,
};
