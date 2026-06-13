/**
 * GitHub Data Service
 * Fetches and caches pack data from a GitHub repository.
 * The packs.json file in the repository acts as the single source of truth.
 */

const fetch = require('node-fetch');
const config = require('../config');
const cache = require('../utils/cache');

/**
 * Fetch the packs.json file from GitHub
 * @returns {Promise<Object>} Pack data from the repository
 */
async function fetchPacksData() {
  const cacheKey = 'github:packs';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3.raw',
      'User-Agent': 'BetterBedwars-Website/1.0',
    };
    if (config.github.token) {
      headers['Authorization'] = `token ${config.github.token}`;
    }

    const response = await fetch(config.github.rawUrl, {
      headers,
      timeout: 10000,
    });

    if (!response.ok) {
      console.error(`[GitHub] Failed to fetch packs.json: ${response.status} ${response.statusText}`);
      // Try to use locally cached/fallback data
      return getLocalFallback();
    }

    const data = await response.json();
    cache.set(cacheKey, data, config.cache.packs);
    console.log('[GitHub] Successfully fetched packs.json');
    return data;
  } catch (error) {
    console.error('[GitHub] Error fetching packs.json:', error.message);
    return getLocalFallback();
  }
}

/**
 * Get local fallback data if GitHub is unavailable
 * @returns {Object} Default pack data
 */
function getLocalFallback() {
  const localCache = cache.get('github:packs:local');
  if (localCache) return localCache;

  // Default fallback data based on known pack information
  const fallback = {
    '1': {
      name: 'Better Bedwars',
      slug: 'betterbedwars',
      description: 'A 1.8.9 PVP Texture Pack designed for Bedwars players.',
      short_description: 'A 1.8.9 PVP Texture Pack for Bedwars',
      edition: ['java', 'bedrock'],
      featured: true,
      thumbnail: '',
      gallery: [],
      supported_versions: ['1.8.9'],
      categories: ['pvp', 'bedwars', 'texture-pack'],
      links: {
        curseforge: 'https://www.curseforge.com/minecraft/texture-packs/betterbedwars',
        modrinth: 'https://modrinth.com/resourcepack/betterbedwars',
        planetminecraft: 'https://www.planetminecraft.com/texture-pack/betterbedwars/',
        mcpedl: 'https://mcpedl.com/betterbedwars/',
      },
      other_websites: {},
    },
  };

  cache.set('github:packs:local', fallback, config.cache.packs);
  return fallback;
}

/**
 * Save packs data locally for offline fallback
 * @param {Object} data
 */
function saveLocalFallback(data) {
  cache.set('github:packs:local', data, 86400000); // 24 hours
}

/**
 * Force refresh the pack data cache
 * @returns {Promise<Object>}
 */
async function refreshPacksData() {
  cache.del('github:packs');
  return await fetchPacksData();
}

/**
 * Get a single pack by slug
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
async function getPackBySlug(slug) {
  const packs = await fetchPacksData();
  for (const [id, pack] of Object.entries(packs)) {
    if (pack.slug === slug || pack.name?.toLowerCase().replace(/\s+/g, '-') === slug) {
      return { id, ...pack };
    }
  }
  return null;
}

/**
 * Get a single pack by ID
 * @param {string|number} id
 * @returns {Promise<Object|null>}
 */
async function getPackById(id) {
  const packs = await fetchPacksData();
  const pack = packs[String(id)];
  if (pack) {
    return { id, ...pack };
  }
  return null;
}

/**
 * Get all packs as an array
 * @returns {Promise<Array>}
 */
async function getAllPacks() {
  const packs = await fetchPacksData();
  return Object.entries(packs).map(([id, pack]) => ({ id, ...pack }));
}

/**
 * Get featured packs
 * @returns {Promise<Array>}
 */
async function getFeaturedPacks() {
  const all = await getAllPacks();
  return all.filter(p => p.featured);
}

module.exports = {
  fetchPacksData,
  refreshPacksData,
  getPackBySlug,
  getPackById,
  getAllPacks,
  getFeaturedPacks,
  saveLocalFallback,
};