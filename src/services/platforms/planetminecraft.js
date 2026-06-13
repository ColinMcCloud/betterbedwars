/**
 * PlanetMinecraft Platform Collector
 * Extracts metadata from PlanetMinecraft texture pack pages.
 */

const BasePlatformCollector = require('./base');

class PlanetMinecraftCollector extends BasePlatformCollector {
  constructor() {
    super('PlanetMinecraft', 'platform:pmc', 600000); // 10 min cache
  }

  /**
   * Extract project slug from PMC URL
   * @param {string} url
   * @returns {string|null}
   */
  extractSlug(url) {
    if (!url) return null;
    const match = url.match(/planetminecraft\.com\/texture-pack\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract metadata from a PlanetMinecraft URL
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async extractMetadata(url) {
    const html = await this.fetchUrl(url);
    if (!html) return null;

    const slug = this.extractSlug(url);
    const metadata = {
      platform: 'planetminecraft',
      url: url,
      slug: slug,
      name: null,
      description: null,
      downloads: 0,
      thumbnail: null,
      lastUpdated: null,
      versions: [],
      author: null,
    };

    // Extract title
    const titleMatch = html.match(/<meta\s+(?:property="og:title"|name="title")\s+content="([^"]+)"/i)
      || html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      metadata.name = titleMatch[1].replace(/\s*[-–|]\s*Planet\s*Minecraft.*$/i, '').trim();
    }

    // Extract description
    const descMatch = html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]+)"/i);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    }

    // Extract thumbnail
    const thumbMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (thumbMatch) {
      metadata.thumbnail = thumbMatch[1];
    }

    // Extract download count
    const dlMatch = html.match(/([\d,]+)\s*(?:downloads|DLs)/i)
      || html.match(/class="[^"]*download[^"]*"[^>]*>[\s\S]*?([\d,]+)/i);
    if (dlMatch) {
      metadata.downloads = parseInt(dlMatch[1].replace(/,/g, ''), 10) || 0;
    }

    // Extract author
    const authorMatch = html.match(/(?:by|author)[^<]*<[^>]*href="[^"]*\/member\/([^"\/]+)[^"]*"[^>]*>([^<]+)/i)
      || html.match(/class="[^"]*author[^"]*"[^>]*>[^<]*<a[^>]*>([^<]+)/i);
    if (authorMatch) {
      metadata.author = (authorMatch[2] || authorMatch[1] || '').trim();
    }

    // Extract last updated
    const updateMatch = html.match(/(?:updated|modified|date)[^:]*:\s*(?:<[^>]+>)*\s*(\w+\s+\d{1,2},?\s*\d{4})/i);
    if (updateMatch) {
      metadata.lastUpdated = updateMatch[1].trim();
    }

    // Extract Minecraft versions
    const versionMatches = html.matchAll(/(\d+\.\d+(?:\.\d+)?)\s*(?:compatible|support|x[68])/gi);
    for (const match of versionMatches) {
      const v = match[1].trim();
      if (!metadata.versions.includes(v)) {
        metadata.versions.push(v);
      }
    }

    return metadata;
  }

  /**
   * Get download count from PlanetMinecraft
   * @param {string} url
   * @returns {Promise<number>}
   */
  async getDownloadCount(url) {
    const meta = await this.safeExtractMetadata(url);
    return meta ? meta.downloads : 0;
  }
}

module.exports = new PlanetMinecraftCollector();