/**
 * Contact Route
 * Contact form and contact information page.
 */

const express = require('express');
const router = express.Router();
const { isValidEmail, escapeHtml } = require('../utils/helpers');
const config = require('../config');

// In-memory storage for contact submissions (replace with database in production)
const submissions = [];

router.get('/', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact - Better Bedwars',
    description: 'Get in touch with the Better Bedwars team. Send us a message or join our Discord community.',
    success: req.query.success === '1',
    error: null,
  });
});

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  const errors = [];
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }
  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!subject || subject.trim().length < 2) {
    errors.push('Subject must be at least 2 characters.');
  }
  if (!message || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters.');
  }

  if (errors.length > 0) {
    return res.render('pages/contact', {
      title: 'Contact - Better Bedwars',
      description: 'Get in touch with the Better Bedwars team.',
      success: false,
      error: errors.join(' '),
      formData: { name, email, subject, message },
    });
  }

  // Store submission
  submissions.push({
    id: submissions.length + 1,
    name: escapeHtml(name.trim()),
    email: escapeHtml(email.trim()),
    subject: escapeHtml(subject.trim()),
    message: escapeHtml(message.trim()),
    timestamp: new Date().toISOString(),
    ip: req.ip,
  });

  console.log(`[Contact] New submission from ${name} (${email}): ${subject}`);

  res.render('pages/contact', {
    title: 'Contact - Better Bedwars',
    description: 'Get in touch with the Better Bedwars team.',
    success: true,
    error: null,
  });
});

// Get all submissions (admin only)
router.get('/submissions', (req, res) => {
  const adminKey = req.query.key || req.cookies.admin_key;
  if (adminKey !== config.admin.key) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json({ submissions: submissions.reverse() });
});

module.exports = router;