require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');
const analyticsRoutes = require('./routes/analytics');
const { redirect } = require('./controllers/urlController');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const redirectLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  if (req.path === '/api/url/shorten') console.log('BODY:', JSON.stringify(req.body));
  next();
});
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'mongodb' })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Short URL redirect — MUST be last (catches /:code)
app.get('/:code', redirectLimiter, redirect);

// 404 fallback
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 URLSnip server running on http://localhost:${PORT}`);
    console.log(`🍃 Database: MongoDB`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch(console.error);
