/**
 * MCPEDL Platform Collector
 * Extracts metadata from MCPEDL texture pack pages (Bedrock Edition).
 */

const BasePlatformCollector = require('./base');

class McpedlCollector extends BasePlatformCollector {
  constructor() {
    super('MCPEDL', 'platform:mcpedl', 600000); // 10 min cache
  }

  /**
   * Extract project slug from MCPEDL URL
   * @param {string} url
   * @returns {string|null}
   */
  extractSlug(url) {
    if (!url) return null;
    const match = url.match(/mcpedl\.com\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract metadata from a MCPEDL URL
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async extractMetadata(url) {
    const html = await this.fetchUrl(url);
    if (!html) return null;

    const slug = this.extractSlug(url);
    const metadata = {
      platform: 'mcpedl',
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
      metadata.name = titleMatch[1].replace(/\s*[-–|]\s*MCPEDL.*$/i, '').trim();
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
    const authorMatch = html.match(/(?:by|author|uploaded by)[^<]*<[^>]*>([^<]+)/i)
      || html.match(/class="[^"]*author[^"]*"[^>]*>[^<]*<a[^>]*>([^<]+)/i);
    if (authorMatch) {
      metadata.author = authorMatch[1].trim();
    }

    // Extract last updated
    const updateMatch = html.match(/(?:updated|date|published)[^:]*:\s*(?:<[^>]+>)*\s*(\w+\s+\d{1,2},?\s*\d{4})/i)
      || html.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (updateMatch) {
      metadata.lastUpdated = updateMatch[1].trim();
    }

    // Extract supported versions
    const versionMatches = html.matchAll(/(?:MCPE|Bedrock|Version)\s*(\d+\.\d+(?:\.\d+)?)/gi);
    for (const match of versionMatches) {
      const v = match[1].trim();
      if (!metadata.versions.includes(v)) {
        metadata.versions.push(v);
      }
    }

    return metadata;
  }

  /**
   * Get download count from MCPEDL
   * @param {string} url
   * @returns {Promise<number>}
   */
  async getDownloadCount(url) {
    const meta = await this.safeExtractMetadata(url);
    return meta ? meta.downloads : 0;
  }
}

module.exports = new McpedlCollector();