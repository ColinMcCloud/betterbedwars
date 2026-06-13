/**
 * Downloads Route
 * Primary download hub for the main texture pack.
 */

const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const statsService = require('../services/statsService');

router.get('/', async (req, res) => {
  try {
    const packs = await githubService.getAllPacks();
    // Use the first featured pack or the first pack as the main pack
    const featuredPacks = await githubService.getFeaturedPacks();
    const mainPack = featuredPacks[0] || packs[0] || null;

    let packStats = null;
    if (mainPack) {
      try {
        const rawStats = await statsService.getPackStats(mainPack);
        packStats = statsService.formatStats(rawStats);
      } catch (e) {
        console.error('[Downloads] Stats error:', e.message);
      }
    }

    let globalStats = null;
    try {
      globalStats = await statsService.getGlobalStats();
      globalStats = statsService.formatGlobalStats(globalStats);
    } catch (e) {
      // Non-critical
    }

    res.render('pages/downloads', {
      title: 'Downloads - Better Bedwars',
      description: 'Download Better Bedwars texture pack for Minecraft 1.8.9. Available on CurseForge, Modrinth, and PlanetMinecraft.',
      mainPack,
      packStats,
      globalStats,
      packs,
    });
  } catch (error) {
    console.error('[Downloads] Error:', error.message);
    res.render('pages/downloads', {
      title: 'Downloads - Better Bedwars',
      description: 'Download Better Bedwars texture pack for Minecraft 1.8.9.',
      mainPack: null,
      packStats: null,
      globalStats: null,
      packs: [],
    });
  }
});

module.exports = router;