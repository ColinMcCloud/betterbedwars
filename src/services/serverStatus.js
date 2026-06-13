/**
 * Minecraft Server Status Service
 * Queries the Minecraft server for player count, status, and version info.
 * Uses the mcstatus.io API or direct ping.
 */

const fetch = require('node-fetch');
const config = require('../config');
const cache = require('../utils/cache');

const CACHE_KEY = 'server:status';
const CACHE_TTL = 30000; // 30 seconds

/**
 * Get the current server status
 * @returns {Promise<Object>}
 */
async function getServerStatus() {
  const cached = cache.get(CACHE_KEY);
  if (cached) return cached;

  const host = config.server_status.host;
  const port = config.server_status.port;

  const status = {
    online: false,
    host: host,
    port: port,
    players: { online: 0, max: 0 },
    version: 'Unknown',
    motd: '',
    latency: 0,
    lastChecked: new Date().toISOString(),
  };

  try {
    // Try mcstatus.io API first
    const response = await fetch(`https://api.mcsrvstat.us/2/${host}:${port}`, {
      timeout: 8000,
      headers: { 'User-Agent': 'BetterBedwars-Website/1.0' },
    });

    if (response.ok) {
      const data = await response.json();
      status.online = data.online || false;
      if (data.players) {
        status.players.online = data.players.online || 0;
        status.players.max = data.players.max || 0;
      }
      if (data.version) {
        status.version = data.version;
      }
      if (data.motd && data.motd.clean) {
        status.motd = data.motd.clean;
      }
      if (data.ping) {
        status.latency = data.ping;
      }
    }
  } catch (error) {
    console.error('[ServerStatus] Error fetching server status:', error.message);
    // Try alternative API
    try {
      const response = await fetch(`https://mcapi.us/server/status?ip=${host}&port=${port}`, {
        timeout: 8000,
        headers: { 'User-Agent': 'BetterBedwars-Website/1.0' },
      });
      if (response.ok) {
        const data = await response.json();
        status.online = data.online || false;
        if (data.players) {
          status.players.online = data.players.now || 0;
          status.players.max = data.players.max || 0;
        }
        if (data.server && data.server.name) {
          status.version = data.server.name;
        }
      }
    } catch (e2) {
      console.error('[ServerStatus] Alternative API also failed:', e2.message);
    }
  }

  cache.set(CACHE_KEY, status, CACHE_TTL);
  return status;
}

/**
 * Get a simple online/offline status
 * @returns {Promise<boolean>}
 */
async function isOnline() {
  const status = await getServerStatus();
  return status.online;
}

module.exports = {
  getServerStatus,
  isOnline,
};