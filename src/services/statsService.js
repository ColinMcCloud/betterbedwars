/**
 * Statistics Aggregation Service
 * Collects and aggregates download statistics from all platforms.
 * Provides per-pack and global statistics.
 */

const config = require('../config');
const cache = require('../utils/cache');
const githubService = require('./githubService');
const { getCollector } = require('./platforms');
const { formatNumber } = require('../utils/helpers');

/**
 * Get download statistics for a single pack
 * @param {Object} pack - Pack data from GitHub
 * @returns {Promise<Object>}
 */
async function getPackStats(pack) {
  const cacheKey = `stats:pack:${pack.id || pack.slug}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const stats = {
    platforms: {},
    total: 0,
    lastUpdated: null,
  };

  if (!pack.links) return stats;

  // Collect stats from each platform
  const platformPromises = Object.entries(pack.links).map(async ([platform, url]) => {
    if (!url) return;
    const collector = getCollector(platform);
    if (!collector) return;

    try {
      const metadata = await collector.safeExtractMetadata(url);
      if (metadata) {
        stats.platforms[platform] = {
          downloads: metadata.downloads || 0,
          url: url,
          name: metadata.name || platform,
          lastUpdated: metadata.lastUpdated,
        };
        stats.total += metadata.downloads || 0;

        // Track the most recent update
        if (metadata.lastUpdated) {
          const d = new Date(metadata.lastUpdated);
          if (!stats.lastUpdated || d > new Date(stats.lastUpdated)) {
            stats.lastUpdated = metadata.lastUpdated;
          }
        }
      }
    } catch (error) {
      console.error(`[Stats] Error getting ${platform} stats for pack ${pack.slug}:`, error.message);
    }
  });

  await Promise.allSettled(platformPromises);

  cache.set(cacheKey, stats, config.cache.stats);
  return stats;
}

/**
 * Get global statistics across all packs
 * @returns {Promise<Object>}
 */
async function getGlobalStats() {
  const cacheKey = 'stats:global';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const packs = await githubService.getAllPacks();
  const globalStats = {
    totalDownloads: 0,
    totalPacks: packs.length,
    byPlatform: {},
    mostDownloaded: null,
    recentlyUpdated: [],
    featuredPacks: [],
  };

  // Collect stats for each pack
  const packStatsPromises = packs.map(async (pack) => {
    const stats = await getPackStats(pack);
    return { pack, stats };
  });

  const results = await Promise.allSettled(packStatsPromises);

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const { pack, stats } = result.value;

    globalStats.totalDownloads += stats.total;

    // Aggregate by platform
    for (const [platform, data] of Object.entries(stats.platforms)) {
      if (!globalStats.byPlatform[platform]) {
        globalStats.byPlatform[platform] = 0;
      }
      globalStats.byPlatform[platform] += data.downloads;
    }

    // Track most downloaded
    if (!globalStats.mostDownloaded || stats.total > globalStats.mostDownloaded.downloads) {
      globalStats.mostDownloaded = { ...pack, downloads: stats.total };
    }

    // Track recently updated
    if (stats.lastUpdated) {
      globalStats.recentlyUpdated.push({ ...pack, lastUpdated: stats.lastUpdated, downloads: stats.total });
    }

    // Track featured packs
    if (pack.featured) {
      globalStats.featuredPacks.push({ ...pack, downloads: stats.total });
    }
  }

  // Sort recently updated by date
  globalStats.recentlyUpdated.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  globalStats.recentlyUpdated = globalStats.recentlyUpdated.slice(0, 5);

  // Sort featured packs by downloads
  globalStats.featuredPacks.sort((a, b) => b.downloads - a.downloads);

  cache.set(cacheKey, globalStats, config.cache.stats);
  return globalStats;
}

/**
 * Format stats for display
 * @param {Object} stats
 * @returns {Object}
 */
function formatStats(stats) {
  return {
    ...stats,
    totalFormatted: formatNumber(stats.total),
    platforms: Object.fromEntries(
      Object.entries(stats.platforms).map(([k, v]) => [k, { ...v, downloadsFormatted: formatNumber(v.downloads) }])
    ),
  };
}

/**
 * Format global stats for display
 * @param {Object} stats
 * @returns {Object}
 */
function formatGlobalStats(stats) {
  return {
    ...stats,
    totalDownloadsFormatted: formatNumber(stats.totalDownloads),
    byPlatformFormatted: Object.fromEntries(
      Object.entries(stats.byPlatform).map(([k, v]) => [k, formatNumber(v)])
    ),
  };
}

module.exports = {
  getPackStats,
  getGlobalStats,
  formatStats,
  formatGlobalStats,
};