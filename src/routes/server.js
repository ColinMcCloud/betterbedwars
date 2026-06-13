/**
 * Server Status Route
 * Display Minecraft server status, player count, and info.
 */

const express = require('express');
const router = express.Router();
const serverStatus = require('../services/serverStatus');

router.get('/', async (req, res) => {
  try {
    const status = await serverStatus.getServerStatus();
    res.render('pages/server', {
      title: 'Server - Better Bedwars',
      description: 'Join the Better Bedwars Minecraft server. Check server status, player count, and connect.',
      serverStatus: status,
    });
  } catch (error) {
    console.error('[Server] Error:', error.message);
    res.render('pages/server', {
      title: 'Server - Better Bedwars',
      description: 'Join the Better Bedwars Minecraft server.',
      serverStatus: {
        online: false,
        host: 'play.betterbedwars.com',
        port: 25565,
        players: { online: 0, max: 0 },
        version: 'Unknown',
        motd: '',
        latency: 0,
        lastChecked: new Date().toISOString(),
      },
    });
  }
});

// API endpoint for live status updates (used by AJAX)
router.get('/status', async (req, res) => {
  try {
    const status = await serverStatus.getServerStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server status' });
  }
});

module.exports = router;