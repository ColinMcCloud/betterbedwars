/**
 * In-memory caching system
 * Provides TTL-based caching for API responses, metadata, and statistics.
 */

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Get a cached value by key
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if expired/not found
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds
   */
  set(key, value, ttlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });
  }

  /**
   * Check if a key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   * @param {string} key - Cache key
   */
  del(key) {
    this.store.delete(key);
  }

  /**
   * Clear all cached entries
   */
  flush() {
    this.store.clear();
  }

  /**
   * Clear all entries matching a prefix
   * @param {string} prefix - Key prefix to match
   */
  flushPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  stats() {
    let valid = 0;
    let expired = 0;
    for (const entry of this.store.values()) {
      if (Date.now() > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }
    return { total: this.store.size, valid, expired };
  }
}

// Singleton instance
const cache = new MemoryCache();

module.exports = cache;