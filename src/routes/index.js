/**
 * Index (Home) Route
 */

const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const statsService = require('../services/statsService');

router.get('/', async (req, res) => {
  try {
    const packs = await githubService.getAllPacks();
    const featuredPacks = await githubService.getFeaturedPacks();
    let globalStats = null;
    try {
      globalStats = await statsService.getGlobalStats();
      globalStats = statsService.formatGlobalStats(globalStats);
    } catch (e) {
      console.error('[Home] Stats error:', e.message);
    }

    res.render('pages/home', {
      title: 'Better Bedwars - A 1.8.9 PVP Texture Pack',
      description: 'Better Bedwars is a premium 1.8.9 Minecraft PVP texture pack designed for Bedwars players. Clean visuals, optimized performance, and competitive advantages.',
      packs,
      featuredPacks,
      globalStats,
    });
  } catch (error) {
    console.error('[Home] Error:', error.message);
    res.render('pages/home', {
      title: 'Better Bedwars - A 1.8.9 PVP Texture Pack',
      description: 'Better Bedwars is a premium 1.8.9 Minecraft PVP texture pack designed for Bedw players.',
      packs: [],
      featuredPacks: [],
      globalStats: null,
    });
  }
});

module.exports = router;