/**
 * Central Configuration Module
 * All application settings are loaded from environment variables with sensible defaults.
 * Edit .env file to change settings without modifying application code.
 */

require('dotenv').config();

const config = {
  // Server settings
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  },

  // Admin settings
  admin: {
    key: process.env.ADMIN_KEY || 'dev-admin-key',
    email: process.env.ADMIN_EMAIL || 'support@betterbedwars.com',
  },

  // Site branding and identity
  site: {
    name: 'Better Bedwars',
    tagline: 'A 1.8.9 PVP Texture Pack! We make Bedwars, better.',
    description: 'Better Bedwars is a premium 1.8.9 Minecraft PVP texture pack designed for Bedwars players. Featuring clean visuals, optimized performance, and competitive advantages.',
    url: process.env.SITE_URL || 'https://betterbedwars.com',
    since: 2021,
    supportEmail: process.env.ADMIN_EMAIL || 'support@betterbedwars.com',
  },

  // Social links
  social: {
    youtube: 'https://youtube.com/@betterbedwars',
    instagram: 'https://instagram.com/betterbedwars',
    tiktok: 'https://tiktok.com/@betterbedwars',
    twitter: 'https://twitter.com/betterbedwars',
    bluesky: 'https://bsky.app/profile/betterbedwars.com',
    discord: 'https://discord.gg/jADnherbZS',
    github: 'https://github.com/betterbedwars',
  },

  // Minecraft server
  server_status: {
    host: process.env.MINECRAFT_SERVER_HOST || 'play.betterbedwars.com',
    port: parseInt(process.env.MINECRAFT_SERVER_PORT, 10) || 25565,
  },

  // GitHub repository configuration
  github: {
    owner: process.env.GITHUB_REPO_OWNER || 'betterbedwars',
    repo: process.env.GITHUB_REPO_NAME || 'betterbedwars-data',
    branch: process.env.GITHUB_REPO_BRANCH || 'main',
    packsFile: process.env.GITHUB_PACKS_FILE || 'packs.json',
    rawUrl: process.env.GITHUB_RAW_URL || 'https://raw.githubusercontent.com/betterbedwars/betterbedwars-data/main/packs.json',
    token: process.env.GITHUB_TOKEN || '',
  },

  // Cache durations in milliseconds
  cache: {
    packs: parseInt(process.env.CACHE_DURATION_PACKS, 10) || 300000,       // 5 minutes
    metadata: parseInt(process.env.CACHE_DURATION_METADATA, 10) || 600000, // 10 minutes
    stats: parseInt(process.env.CACHE_DURATION_STATS, 10) || 300000,       // 5 minutes
    gallery: parseInt(process.env.CACHE_DURATION_GALLERY, 10) || 900000,   // 15 minutes
  },

  // Contact form
  contact: {
    enabled: process.env.CONTACT_FORM_ENABLED === 'true',
    email: process.env.CONTACT_EMAIL || 'support@betterbedwars.com',
  },

  // Analytics
  analytics: {
    trackingId: process.env.GA_TRACKING_ID || '',
  },

  // Supported platforms for metadata collection
  platforms: [
    'curseforge',
    'modrinth',
    'planetminecraft',
    'mcpedl',
  ],
};

module.exports = config;