/**
 * Admin Route
 * Lightweight admin system for cache management and statistics.
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const cache = require('../utils/cache');
const githubService = require('../services/githubService');
const statsService = require('../services/statsService');

// Admin authentication middleware
function requireAdmin(req, res, next) {
  const key = req.query.key || req.cookies.admin_key;
  if (key !== config.admin.key) {
    return res.status(403).render('pages/403', {
      title: '403 - Access Denied',
      description: 'You do not have permission to access this page.',
    });
  }
  next();
}

// Admin dashboard
router.get('/', requireAdmin, async (req, res) => {
  try {
    const cacheStats = cache.stats();
    const packs = await githubService.getAllPacks();
    let globalStats = null;
    try {
      globalStats = await statsService.getGlobalStats();
      globalStats = statsService.formatGlobalStats(globalStats);
    } catch (e) {
      // Non-critical
    }

    res.render('pages/admin', {
      title: 'Admin Dashboard - Better Bedwars',
      description: 'Admin dashboard for the Better Bedwars website.',
      cacheStats,
      packs,
      globalStats,
      adminKey: req.query.key,
    });
  } catch (error) {
    console.error('[Admin] Error:', error.message);
    res.status(500).render('pages/500', {
      title: '500 - Server Error',
      description: 'An error occurred.',
      error: null,
    });
  }
});

// Force refresh GitHub data
router.post('/refresh', requireAdmin, async (req, res) => {
  try {
    await githubService.refreshPacksData();
    cache.flush();
    res.json({ success: true, message: 'Cache cleared and data refreshed.' });
  } catch (error) {
    console.error('[Admin] Refresh error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cache statistics
router.get('/cache', requireAdmin, (req, res) => {
  res.json(cache.stats());
});

// Clear cache
router.post('/cache/clear', requireAdmin, (req, res) => {
  cache.flush();
  res.json({ success: true, message: 'All caches cleared.' });
});

module.exports = router;