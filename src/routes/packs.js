/**
 * Packs Route
 * Browse all packs and view individual pack pages.
 */

const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const statsService = require('../services/statsService');

// Packs listing page
router.get('/', async (req, res) => {
  try {
    const packs = await githubService.getAllPacks();
    const featuredPacks = await githubService.getFeaturedPacks();

    res.render('pages/packs', {
      title: 'Texture Packs - Better Bedwars',
      description: 'Browse all available Better Bedwars texture packs. Download for Minecraft Java and Bedrock editions.',
      packs,
      featuredPacks,
    });
  } catch (error) {
    console.error('[Packs] Error:', error.message);
    res.render('pages/packs', {
      title: 'Texture Packs - Better Bedwars',
      description: 'Browse all available Better Bedwars texture packs.',
      packs: [],
      featuredPacks: [],
    });
  }
});

// Individual pack page
router.get('/:slug', async (req, res) => {
  try {
    const pack = await githubService.getPackBySlug(req.params.slug);
    if (!pack) {
      return res.status(404).render('pages/404', {
        title: '404 - Pack Not Found',
        description: 'The requested texture pack was not found.',
      });
    }

    let packStats = null;
    try {
      const rawStats = await statsService.getPackStats(pack);
      packStats = statsService.formatStats(rawStats);
    } catch (e) {
      console.error('[Pack Page] Stats error:', e.message);
    }

    // Get related packs (other packs)
    const allPacks = await githubService.getAllPacks();
    const relatedPacks = allPacks.filter(p => p.id !== pack.id).slice(0, 3);

    res.render('pages/pack-detail', {
      title: `${pack.name || 'Pack'} - Better Bedwars`,
      description: pack.short_description || pack.description || `Download ${pack.name} from Better Bedwars.`,
      pack,
      packStats,
      relatedPacks,
    });
  } catch (error) {
    console.error('[Pack Page] Error:', error.message);
    res.status(500).render('pages/500', {
      title: '500 - Server Error',
      description: 'An error occurred loading this pack.',
      error: null,
    });
  }
});

module.exports = router;