/**
 * Modrinth Platform Collector
 * Uses the Modrinth API to extract metadata from resource packs.
 */

const BasePlatformCollector = require('./base');

class ModrinthCollector extends BasePlatformCollector {
  constructor() {
    super('Modrinth', 'platform:modrinth', 600000); // 10 min cache
    this.apiBase = 'https://api.modrinth.com/v2';
  }

  /**
   * Extract project slug from Modrinth URL
   * @param {string} url
   * @returns {string|null}
   */
  extractSlug(url) {
    if (!url) return null;
    const match = url.match(/modrinth\.com\/(?:resourcepack|mod)\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract metadata from a Modrinth URL using their API
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async extractMetadata(url) {
    const slug = this.extractSlug(url);
    if (!slug) return null;

    // Use Modrinth API to get project data
    const apiUrl = `${this.apiBase}/project/${slug}`;
    const data = await this.fetchJson(apiUrl);
    if (!data) return null;

    const metadata = {
      platform: 'modrinth',
      url: url,
      slug: slug,
      name: data.title || null,
      description: data.description || null,
      downloads: data.downloads || 0,
      thumbnail: null,
      lastUpdated: data.updated || data.published || null,
      versions: [],
      categories: data.categories || [],
      author: null,
    };

    // Get thumbnail
    if (data.icon_url) {
      metadata.thumbnail = data.icon_url;
    }

    // Get team members for author
    if (data.team) {
      try {
        const teamData = await this.fetchJson(`${this.apiBase}/team/${data.team}/members`);
        if (teamData && teamData.length > 0) {
          const owner = teamData.find(m => m.role === 'Owner') || teamData[0];
          if (owner && owner.user) {
            metadata.author = owner.user.username;
          }
        }
      } catch (e) {
        // Non-critical, continue without author
      }
    }

    // Get supported versions from latest version file
    if (data.versions && data.versions.length > 0) {
      try {
        // Get the latest version
        const versionData = await this.fetchJson(`${this.apiBase}/version/${data.versions[0]}`);
        if (versionData) {
          metadata.game_versions = versionData.game_versions || [];
          metadata.loaders = versionData.loaders || [];
          metadata.latestVersion = versionData.version_number;
          if (versionData.date_created) {
            metadata.lastUpdated = versionData.date_created;
          }
        }
      } catch (e) {
        // Non-critical
      }
    }

    return metadata;
  }

  /**
   * Get download count from Modrinth
   * @param {string} url
   * @returns {Promise<number>}
   */
  async getDownloadCount(url) {
    const meta = await this.safeExtractMetadata(url);
    return meta ? meta.downloads : 0;
  }
}

module.exports = new ModrinthCollector();