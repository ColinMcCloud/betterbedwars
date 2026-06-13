/**
 * Base Platform Collector
 * Abstract base class for all platform metadata collectors.
 * Each platform collector extends this and implements platform-specific logic.
 */

const fetch = require('node-fetch');
const cache = require('../../utils/cache');

class BasePlatformCollector {
  constructor(name, cachePrefix, cacheTtl) {
    this.name = name;
    this.cachePrefix = cachePrefix;
    this.cacheTtl = cacheTtl;
  }

  /**
   * Get cached data for a URL
   * @param {string} url
   * @returns {Object|null}
   */
  getCached(url) {
    return cache.get(`${this.cachePrefix}:${url}`);
  }

  /**
   * Set cached data for a URL
   * @param {string} url
   * @param {Object} data
   */
  setCached(url, data) {
    cache.set(`${this.cachePrefix}:${url}`, data, this.cacheTtl);
  }

  /**
   * Fetch URL with error handling and timeout
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<string|null>}
   */
  async fetchUrl(url, options = {}) {
    try {
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'BetterBedwars-Website/1.0',
          ...options.headers,
        },
        ...options,
      });
      if (!response.ok) {
        console.error(`[${this.name}] HTTP ${response.status} for ${url}`);
        return null;
      }
      return await response.text();
    } catch (error) {
      console.error(`[${this.name}] Error fetching ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch JSON from a URL with error handling
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Object|null>}
   */
  async fetchJson(url, options = {}) {
    try {
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'BetterBedwars-Website/1.0',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      if (!response.ok) {
        console.error(`[${this.name}] HTTP ${response.status} for ${url}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`[${this.name}] Error fetching JSON from ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Extract metadata from a platform URL
   * Must be implemented by subclasses.
   * @param {string} url - The platform project URL
   * @returns {Promise<Object>} Normalized metadata
   */
  async extractMetadata(url) {
    throw new Error(`[${this.name}] extractMetadata() must be implemented`);
  }

  /**
   * Get download count for a project
   * @param {string} url
   * @returns {Promise<number>}
   */
  async getDownloadCount(url) {
    return 0;
  }

  /**
   * Safely extract metadata with error handling and caching
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async safeExtractMetadata(url) {
    if (!url) return null;

    const cached = this.getCached(url);
    if (cached) return cached;

    try {
      const metadata = await this.extractMetadata(url);
      if (metadata) {
        this.setCached(url, metadata);
      }
      return metadata;
    } catch (error) {
      console.error(`[${this.name}] Error extracting metadata from ${url}:`, error.message);
      return null;
    }
  }
}

module.exports = BasePlatformCollector;