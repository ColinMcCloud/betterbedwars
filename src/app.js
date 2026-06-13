/**
 * Better Bedwars Website - Main Application Entry Point
 * Express.js server with EJS templating, security middleware, and dynamic content.
 */

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');

const app = express();

// ── Security Middleware ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.mcsrvstat.us", "https://mcapi.us", "https://api.modrinth.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── Compression ──
app.use(compression());

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Contact form rate limiter (stricter)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many contact form submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Body Parsing ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Static Files ──
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1d',
  etag: true,
}));

// ── EJS Template Engine ──
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Global Template Variables ──
app.use((req, res, next) => {
  res.locals.config = config;
  res.locals.site = config.site;
  res.locals.social = config.social;
  res.locals.currentPath = req.path;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.formatNumber = require('./utils/helpers').formatNumber;
  res.locals.formatDate = require('./utils/helpers').formatDate;
  res.locals.timeAgo = require('./utils/helpers').timeAgo;
  res.locals.truncate = require('./utils/helpers').truncate;
  res.locals.slugify = require('./utils/helpers').slugify;
  next();
});

// ── Routes ──
const indexRoutes = require('./routes/index');
const downloadRoutes = require('./routes/downloads');
const packsRoutes = require('./routes/packs');
const serverRoutes = require('./routes/server');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

app.use('/', indexRoutes);
app.use('/downloads', downloadRoutes);
app.use('/packs', packsRoutes);
app.use('/server', serverRoutes);
app.use('/contact', contactRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// ── Sitemap ──
app.get('/sitemap.xml', async (req, res) => {
  try {
    const githubService = require('./services/githubService');
    const packs = await githubService.getAllPacks();
    const baseUrl = config.site.url;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const pages = ['/', '/downloads', '/packs', '/server', '/contact'];
    for (const page of pages) {
      xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    for (const pack of packs) {
      const slug = pack.slug || pack.name?.toLowerCase().replace(/\s+/g, '-') || `pack-${pack.id}`;
      xml += `  <url>\n    <loc>${baseUrl}/packs/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    xml += '</urlset>';
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('[Sitemap] Error:', error.message);
    res.status(500).send('Error generating sitemap');
  }
});

// ── robots.txt ──
app.get('/robots.txt', (req, res) => {
  const baseUrl = config.site.url;
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`);
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).render('pages/404', {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
  });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).render('pages/500', {
    title: '500 - Server Error',
    description: 'An internal server error occurred.',
    error: config.server.env === 'development' ? err.message : null,
  });
});

// ── Start Server ──
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`\n  Better Bedwars Website`);
  console.log(`  ─────────────────────`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  Environment: ${config.server.env}`);
  console.log(`  GitHub repo: ${config.github.owner}/${config.github.repo}`);
  console.log(`  Cache durations: packs=${config.cache.packs / 1000}s, metadata=${config.cache.metadata / 1000}s\n`);
});

module.exports = app;