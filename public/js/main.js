/**
 * Better Bedwars - Main JavaScript
 * Handles navigation, accordions, search, filtering, and other interactive features.
 */

(function() {
  'use strict';

  // ── Mobile Navigation Toggle ──
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
      navLinks.classList.toggle('open');
    });

    // Close nav when clicking a link
    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', function(e) {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      }
    });
  }

  // ── Accordion Toggle ──
  window.toggleAccordion = function(trigger) {
    var item = trigger.parentElement;
    var content = item.querySelector('.accordion-content');
    var isOpen = item.classList.contains('open');

    if (isOpen) {
      item.classList.remove('open');
      content.style.maxHeight = '0';
    } else {
      item.classList.add('open');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  };

  // ── Pack Search ──
  var searchInput = document.getElementById('pack-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var query = this.value.toLowerCase().trim();
      var cards = document.querySelectorAll('.pack-card');
      
      cards.forEach(function(card) {
        var title = card.querySelector('.pack-card-title');
        var desc = card.querySelector('.pack-card-desc');
        var text = (title ? title.textContent : '') + ' ' + (desc ? desc.textContent : '');
        
        if (query === '' || text.toLowerCase().indexOf(query) !== -1) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ── Pack Filtering ──
  window.filterPacks = function(filter, btn) {
    // Update active button
    var buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    var cards = document.querySelectorAll('.pack-card');
    
    cards.forEach(function(card) {
      var edition = (card.getAttribute('data-edition') || '').toLowerCase();
      var featured = card.getAttribute('data-featured') === 'true';
      
      var show = false;
      if (filter === 'all') {
        show = true;
      } else if (filter === 'java') {
        show = edition.indexOf('java') !== -1;
      } else if (filter === 'bedrock') {
        show = edition.indexOf('bedrock') !== -1;
      } else if (filter === 'featured') {
        show = featured;
      }
      
      card.style.display = show ? '' : 'none';
    });
  };

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Lazy Loading Images ──
  if ('IntersectionObserver' in window) {
    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    document.querySelectorAll('img[data-src]').forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // ── Header Scroll Effect ──
  var header = document.querySelector('.site-header');
  if (header) {
    var lastScroll = 0;
    window.addEventListener('scroll', function() {
      var currentScroll = window.pageYOffset;
      if (currentScroll > 100) {
        header.style.borderBottomColor = 'rgba(26, 26, 26, 0.8)';
      } else {
        header.style.borderBottomColor = 'rgba(26, 26, 26, 0.6)';
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ── Copy to Clipboard ──
  window.copyToClipboard = function(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        // Could show a toast notification here
      });
    }
  };

  // ── Fade-in Animation on Scroll ──
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section, .pack-card, .stats-bar').forEach(function(el) {
      fadeObserver.observe(el);
    });
  }

})();