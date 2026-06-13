/**
 * CurseForge Platform Collector
 * Extracts metadata from CurseForge texture pack pages.
 */

const BasePlatformCollector = require('./base');

class CurseForgeCollector extends BasePlatformCollector {
  constructor() {
    super('CurseForge', 'platform:curseforge', 600000); // 10 min cache
  }

  /**
   * Extract project slug from CurseForge URL
   * @param {string} url
   * @returns {string|null}
   */
  extractSlug(url) {
    if (!url) return null;
    const match = url.match(/curseforge\.com\/minecraft\/(?:bedrock\/)?texture-packs\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract metadata from a CurseForge URL
   * CurseForge doesn't have a public API, so we scrape basic info from the page
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async extractMetadata(url) {
    const html = await this.fetchUrl(url);
    if (!html) return null;

    const slug = this.extractSlug(url);
    const metadata = {
      platform: 'curseforge',
      url: url,
      slug: slug,
      name: null,
      description: null,
      downloads: 0,
      thumbnail: null,
      lastUpdated: null,
      versions: [],
    };

    // Extract title from og:title or <title>
    const titleMatch = html.match(/<meta\s+(?:property="og:title"|name="title")\s+content="([^"]+)"/i)
      || html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      metadata.name = titleMatch[1].replace(/\s*[-–|]\s*CurseForge.*$/i, '').trim();
    }

    // Extract description from og:description
    const descMatch = html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]+)"/i);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    }

    // Extract thumbnail from og:image
    const thumbMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (thumbMatch) {
      metadata.thumbnail = thumbMatch[1];
    }

    // Extract download count (various selectors)
    const dlMatch = html.match(/class="[^"]*downloads[^"]*"[^>]*>\s*(?:<[^>]+>\s*)*([\d,.KMkm]+)/i)
      || html.match(/([\d,.]+)\s*(?:Downloads|downloads)/i);
    if (dlMatch) {
      metadata.downloads = this.parseDownloadCount(dlMatch[1]);
    }

    // Extract last updated from "Updated" section
    const updateMatch = html.match(/(?:Updated|Last updated|Date published)[^:]*:\s*(?:<[^>]+>)*\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (updateMatch) {
      metadata.lastUpdated = updateMatch[1];
    }

    // Extract supported versions
    const versionRegex = /(?:Minecraft|Version)\s*(\d+\.\d+(?:\.\d+)?)/gi;
    let versionMatch;
    while ((versionMatch = versionRegex.exec(html)) !== null) {
      const v = versionMatch[1].trim();
      if (!metadata.versions.includes(v)) {
        metadata.versions.push(v);
      }
    }

    return metadata;
  }

  /**
   * Get download count from CurseForge
   * @param {string} url
   * @returns {Promise<number>}
   */
  async getDownloadCount(url) {
    const meta = await this.safeExtractMetadata(url);
    return meta ? meta.downloads : 0;
  }

  /**
   * Parse download count string (e.g., "1.2K" -> 1200, "1,234" -> 1234)
   * @param {string} str
   * @returns {number}
   */
  parseDownloadCount(str) {
    if (!str) return 0;
    str = str.replace(/,/g, '');
    if (/k/i.test(str)) return Math.round(parseFloat(str) * 1000);
    if (/m/i.test(str)) return Math.round(parseFloat(str) * 1000000);
    return parseInt(str, 10) || 0;
  }
}

module.exports = new CurseForgeCollector();