/**
 * API Route
 * JSON endpoints for AJAX requests and external integrations.
 */

const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const statsService = require('../services/statsService');
const serverStatus = require('../services/serverStatus');
const cache = require('../utils/cache');

// Get all packs
router.get('/packs', async (req, res) => {
  try {
    const packs = await githubService.getAllPacks();
    res.json({ success: true, packs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single pack by slug
router.get('/packs/:slug', async (req, res) => {
  try {
    const pack = await githubService.getPackBySlug(req.params.slug);
    if (!pack) {
      return res.status(404).json({ success: false, error: 'Pack not found' });
    }
    res.json({ success: true, pack });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pack statistics
router.get('/packs/:slug/stats', async (req, res) => {
  try {
    const pack = await githubService.getPackBySlug(req.params.slug);
    if (!pack) {
      return res.status(404).json({ success: false, error: 'Pack not found' });
    }
    const rawStats = await statsService.getPackStats(pack);
    const stats = statsService.formatStats(rawStats);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get global statistics
router.get('/stats', async (req, res) => {
  try {
    const rawStats = await statsService.getGlobalStats();
    const stats = statsService.formatGlobalStats(rawStats);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get server status
router.get('/server/status', async (req, res) => {
  try {
    const status = await serverStatus.getServerStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server status' });
  }
});

// Get cache stats
router.get('/cache', (req, res) => {
  res.json(cache.stats());
});

module.exports = router;