/**
 * Platform Collectors Index
 * Exports all platform collectors and provides a registry for looking them up by name.
 */

const curseforge = require('./curseforge');
const modrinth = require('./modrinth');
const planetminecraft = require('./planetminecraft');
const mcpedl = require('./mcpedl');

const collectors = {
  curseforge,
  modrinth,
  planetminecraft,
  mcpedl,
};

/**
 * Get a collector by platform name
 * @param {string} platform
 * @returns {Object|null}
 */
function getCollector(platform) {
  return collectors[platform.toLowerCase()] || null;
}

/**
 * Get all registered platform names
 * @returns {string[]}
 */
function getPlatformNames() {
  return Object.keys(collectors);
}

module.exports = {
  collectors,
  getCollector,
  getPlatformNames,
  curseforge,
  modrinth,
  planetminecraft,
  mcpedl,
};