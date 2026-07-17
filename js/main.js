/* ============================================================
   TALKIEPEDIA — Main JavaScript
   Talkie AI Search, Navigation, Scroll Animations,
   localStorage features, Accessibility
   ============================================================ */

// ============================================================
// 1. Theme Initialization (Run immediately to prevent FOUC)
// ============================================================
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
} else {
  document.documentElement.setAttribute('data-theme', 'light');
  localStorage.setItem('theme', 'light');
}

// ============================================================
// 2. DOM Ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initTalkieAI();
  initScrollReveal();
  initBookmarks();
  initContinueListening();
  initSearchPlaceholder();
  initCategoryFilter();
  initTranscriptSearch();
  initMiniPlayer();
});

// ============================================================
// 2. Navigation
// ============================================================
function initNavigation() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const overlay = document.getElementById('mobileOverlay');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
    if (overlay) overlay.classList.toggle('active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close on link click (mobile)
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        links.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

// ============================================================
// 2b. Theme Toggle
// ============================================================
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  
  updateThemeIcons(currentTheme);
  
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      // Add transition class to body for smooth color switching
      document.body.classList.add('theme-transitioning');
      
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcons(newTheme);
      
      // Remove transition class after transition completes to not interfere with hover states
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 300);
    });
  });
}

function updateThemeIcons(theme) {
  const themeToggles = document.querySelectorAll('.theme-toggle-btn i');
  themeToggles.forEach(icon => {
    if (theme === 'light') {
      icon.className = 'fa-solid fa-moon';
    } else {
      icon.className = 'fa-solid fa-sun';
    }
  });
}

// ============================================================
// 3. Talkie AI Search
// ============================================================
const TALKIE_RESPONSES = {
  "How do I crack Microsoft interviews?": {
    results: [
      {
        title: "Dream Your Career Into a Big MNC",
        speaker: "Bharat Chandra · Microsoft",
        timestamp: "12:34",
        timestampLabel: "Interview prep tips",
        snippet: "\"Focus on system design fundamentals. Practice with real-world scenarios, not just textbook problems. Microsoft looks for problem-solving ability and collaboration.\"",
        videoUrl: "episode.html",
        transcriptUrl: "episode.html#transcript"
      },
      {
        title: "Navigating Corporate Success",
        speaker: "Dhananjay Dubey · Forge Alumnus",
        timestamp: "08:15",
        timestampLabel: "Corporate readiness",
        snippet: "\"The key is to demonstrate ownership in every project you've worked on. Companies like Microsoft value people who can take initiative and drive results independently.\"",
        videoUrl: "episode.html",
        transcriptUrl: "episode.html#transcript"
      }
    ],
    related: [
      "What skills do MNC recruiters look for?",
      "How to prepare for system design interviews?",
      "What's the work culture like at Microsoft?"
    ]
  },
  "What's it like working in aerospace?": {
    results: [
      {
        title: "The World of Aerospace",
        speaker: "Sumanvitha KannamReddy · Collins Aerospace",
        timestamp: "05:20",
        timestampLabel: "Day-to-day at Collins",
        snippet: "\"Working in aerospace means you're solving problems that literally send people to the sky. The engineering challenges are unique — every component has to be perfect because lives depend on it.\"",
        videoUrl: "episode.html",
        transcriptUrl: "episode.html#transcript"
      }
    ],
    related: [
      "How do I start a career in aerospace?",
      "What qualifications do aerospace companies look for?",
      "Is aerospace a good career in India?"
    ]
  },
  "Tips for career transition to tech": {
    results: [
      {
        title: "Dream Your Career Into a Big MNC",
        speaker: "Bharat Chandra · Microsoft",
        timestamp: "18:42",
        timestampLabel: "Switching to tech careers",
        snippet: "\"Start with fundamentals — data structures, algorithms, and one programming language deeply. Don't try to learn everything at once. Build projects that solve real problems and contribute to open source.\"",
        videoUrl: "episode.html",
        transcriptUrl: "episode.html#transcript"
      },
      {
        title: "Navigating Corporate Success",
        speaker: "Dhananjay Dubey · Forge Alumnus",
        timestamp: "22:10",
        timestampLabel: "Career pivots",
        snippet: "\"Career transitions are about storytelling. You need to connect your past experience to your future role. Every skill is transferable if you frame it right.\"",
        videoUrl: "episode.html",
        transcriptUrl: "episode.html#transcript"
      }
    ],
    related: [
      "Best resources for learning programming?",
      "How long does a tech career switch take?",
      "Do I need a CS degree for tech jobs?"
    ]
  },
  "How to navigate corporate politics?": {
    results: [
      {
        title: "Navigating Corporate Success",
        speaker: "Dhananjay Dubey · Forge Alumnus",
        timestamp: "15:30",
        timestampLabel: "Corporate dynamics",
        snippet: "\"Corporate politics is not something to avoid — it's something to understand. Build genuine relationships, make your work visible, and always have allies across departments.\"",
        videoUrl: "episode.html",
        transcriptUrl: "episode.html#transcript"
      }
    ],
    related: [
      "How to build a personal brand at work?",
      "Tips for getting promoted faster",
      "How do I handle a difficult manager?"
    ]
  }
};

function initTalkieAI() {
  const overlay = document.getElementById('talkieOverlay');
  const input = document.getElementById('talkieInput');
  const closeBtn = document.getElementById('talkieClose');
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const navSearchBtn = document.getElementById('navSearchBtn');

  if (!overlay) return;

  // Open from hero search
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => openTalkie());
  }

  // Open from nav search
  if (navSearchBtn) {
    navSearchBtn.addEventListener('click', () => openTalkie());
  }

  // Keyboard shortcut: Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('active')) {
        closeTalkie();
      } else {
        openTalkie();
      }
    }
    // Escape to close
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeTalkie();
    }
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeTalkie);
  }

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeTalkie();
  });

  // Input handling
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        searchTalkie(input.value.trim());
      }
    });
  }

  // Trending chips inside overlay
  document.querySelectorAll('.talkie-overlay .trending-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      if (input) input.value = query;
      searchTalkie(query);
    });
  });

  // Hero trending chips
  document.querySelectorAll('.hero .trending-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      openTalkie();
      setTimeout(() => {
        if (input) input.value = query;
        searchTalkie(query);
      }, 300);
    });
  });
}

function openTalkie() {
  const overlay = document.getElementById('talkieOverlay');
  const input = document.getElementById('talkieInput');
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { if (input) input.focus(); }, 100);
}

function closeTalkie() {
  const overlay = document.getElementById('talkieOverlay');
  const input = document.getElementById('talkieInput');
  const results = document.getElementById('talkieResults');
  const suggestions = document.getElementById('talkieSuggestions');
  const related = document.getElementById('talkieRelated');

  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  if (input) input.value = '';
  if (results) { results.style.display = 'none'; results.innerHTML = ''; }
  if (suggestions) suggestions.style.display = '';
  if (related) { related.style.display = 'none'; related.innerHTML = ''; }
}

function searchTalkie(query) {
  const results = document.getElementById('talkieResults');
  const suggestions = document.getElementById('talkieSuggestions');
  const related = document.getElementById('talkieRelated');

  if (!results) return;

  // Find closest match
  let response = TALKIE_RESPONSES[query];
  if (!response) {
    // Fuzzy match: find the key that best matches
    const keys = Object.keys(TALKIE_RESPONSES);
    const lowerQuery = query.toLowerCase();
    const match = keys.find(k => {
      const words = lowerQuery.split(/\s+/);
      return words.some(w => k.toLowerCase().includes(w));
    });
    response = match ? TALKIE_RESPONSES[match] : null;
  }

  // Fallback response
  if (!response) {
    response = {
      results: [
        {
          title: "Dream Your Career Into a Big MNC",
          speaker: "Bharat Chandra · Microsoft",
          timestamp: "00:00",
          timestampLabel: "Full episode",
          snippet: "\"This episode covers a wide range of career topics including interview preparation, company culture, and professional growth strategies.\"",
          videoUrl: "episode.html",
          transcriptUrl: "episode.html#transcript"
        }
      ],
      related: [
        "How do I crack Microsoft interviews?",
        "Tips for career transition to tech",
        "How to navigate corporate politics?"
      ]
    };
  }

  // Hide suggestions, show results
  if (suggestions) suggestions.style.display = 'none';

  // Render results
  results.innerHTML = `
    <div style="margin-bottom: var(--space-4); color: var(--text-muted); font-size: var(--text-sm);">
      🎯 ${response.results.length} relevant episode${response.results.length > 1 ? 's' : ''} found
    </div>
    ${response.results.map(r => `
      <div class="talkie-result-card">
        <div class="talkie-result-header">
          <div class="talkie-result-title">${r.title}</div>
        </div>
        <div class="talkie-result-speaker">${r.speaker}</div>
        <div class="talkie-result-timestamp">
          <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
          Jump to ${r.timestamp} — ${r.timestampLabel}
        </div>
        <div class="talkie-result-snippet">${r.snippet}</div>
        <div class="talkie-result-actions">
          <a href="${r.videoUrl}" class="btn btn-primary" style="font-size: var(--text-xs);">
            <i class="fa-solid fa-play" aria-hidden="true"></i> Watch Clip
          </a>
          <a href="${r.transcriptUrl}" class="btn btn-secondary" style="font-size: var(--text-xs);">
            <i class="fa-regular fa-file-lines" aria-hidden="true"></i> Full Transcript
          </a>
        </div>
      </div>
    `).join('')}
  `;
  results.style.display = '';

  // Render related
  if (related && response.related) {
    related.innerHTML = `
      <h4>💡 Related questions</h4>
      <div class="talkie-related-questions">
        ${response.related.map(q => `
          <button class="talkie-related-q" onclick="document.getElementById('talkieInput').value='${q}'; searchTalkie('${q}');">
            <i class="fa-solid fa-arrow-right" style="margin-right: 8px; font-size: 0.7rem; color: var(--accent-primary);" aria-hidden="true"></i>
            ${q}
          </button>
        `).join('')}
      </div>
    `;
    related.style.display = '';
  }
}

// Global helper to open Talkie with a specific query
window.openTalkieWithQuery = function(query) {
  openTalkie();
  setTimeout(() => {
    const input = document.getElementById('talkieInput');
    if (input) input.value = query;
    searchTalkie(query);
  }, 300);
};

// ============================================================
// 4. Search Placeholder Animation
// ============================================================
function initSearchPlaceholder() {
  const placeholder = document.getElementById('searchPlaceholder');
  if (!placeholder) return;

  const queries = [
    "How do I crack Microsoft interviews?",
    "What's it like working in aerospace?",
    "Tips for first job interview",
    "How to navigate corporate politics?",
    "Career transition to tech"
  ];

  let index = 0;
  setInterval(() => {
    index = (index + 1) % queries.length;
    placeholder.style.opacity = 0;
    setTimeout(() => {
      placeholder.textContent = queries[index];
      placeholder.style.opacity = 1;
    }, 300);
  }, 3000);

  placeholder.style.transition = 'opacity 0.3s ease';
}

// ============================================================
// 5. Scroll Reveal
// ============================================================
function initScrollReveal() {
  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================================
// 6. Bookmarks (localStorage)
// ============================================================
function initBookmarks() {
  const bookmarks = JSON.parse(localStorage.getItem('talkiepedia-bookmarks') || '[]');

  document.querySelectorAll('.btn-bookmark').forEach(btn => {
    const episode = btn.dataset.episode;
    if (bookmarks.includes(episode)) {
      btn.classList.add('active');
      btn.querySelector('i').classList.remove('fa-regular');
      btn.querySelector('i').classList.add('fa-solid');
    }

    btn.addEventListener('click', () => {
      const stored = JSON.parse(localStorage.getItem('talkiepedia-bookmarks') || '[]');
      const icon = btn.querySelector('i');

      if (stored.includes(episode)) {
        const updated = stored.filter(e => e !== episode);
        localStorage.setItem('talkiepedia-bookmarks', JSON.stringify(updated));
        btn.classList.remove('active');
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
      } else {
        stored.push(episode);
        localStorage.setItem('talkiepedia-bookmarks', JSON.stringify(stored));
        btn.classList.add('active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
      }
    });
  });
}

// ============================================================
// 7. Continue Listening (localStorage)
// ============================================================
function initContinueListening() {
  const section = document.getElementById('continueListening');
  const container = document.getElementById('continueListeningCards');
  if (!section || !container) return;

  const history = JSON.parse(localStorage.getItem('talkiepedia-history') || '[]');

  if (history.length === 0) {
    // Demo: add a sample for demonstration
    const demoHistory = [
      {
        id: 'microsoft',
        title: 'Dream Your Career Into a Big MNC',
        speaker: 'Bharat Chandra · Microsoft',
        thumb: 'https://talkiepedia.forgealumnus.com/image/microsoft.png',
        progress: 45
      }
    ];
    localStorage.setItem('talkiepedia-history', JSON.stringify(demoHistory));
    renderContinueListening(demoHistory, container, section);
  } else {
    renderContinueListening(history, container, section);
  }
}

function renderContinueListening(history, container, section) {
  if (history.length === 0) return;

  section.style.display = '';

  container.innerHTML = history.map(ep => `
    <a href="episode.html" class="continue-listening" aria-label="Continue listening to ${ep.title}">
      <div class="continue-thumb">
        <img src="${ep.thumb}" alt="${ep.title}" loading="lazy">
      </div>
      <div class="continue-info">
        <h4>${ep.title}</h4>
        <p>${ep.speaker}</p>
        <div class="continue-progress">
          <div class="continue-progress-bar" style="width:${ep.progress}%;"></div>
        </div>
      </div>
    </a>
  `).join('');
}

// ============================================================
// 8. Category Filter
// ============================================================
function initCategoryFilter() {
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      // Filter the episode grid
      const category = pill.dataset.category;
      const cards = document.querySelectorAll('.podcast-card');
      
      cards.forEach(card => {
        if (category === 'all') {
          card.style.display = 'flex';
        } else {
          const categories = (card.dataset.categories || '').split(',');
          if (categories.includes(category)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });
}

// ============================================================
// 9. Newsletter success
// ============================================================
window.showNewsletterSuccess = function() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  const btn = form.querySelector('.btn-primary');
  if (btn) {
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Subscribed!';
    btn.style.pointerEvents = 'none';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.pointerEvents = '';
      form.reset();
    }, 2000);
  }
};

// ============================================================
// 10. Transcript Search (Episode Detail page)
// ============================================================
function initTranscriptSearch() {
  const searchInput = document.getElementById('transcriptSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const entries = document.querySelectorAll('.transcript-entry');

    entries.forEach(entry => {
      const text = entry.querySelector('.transcript-text');
      if (!text) return;

      const original = text.dataset.original || text.textContent;
      text.dataset.original = original;

      if (!query) {
        text.innerHTML = original;
        entry.style.display = '';
        return;
      }

      if (original.toLowerCase().includes(query)) {
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        text.innerHTML = original.replace(regex, '<mark>$1</mark>');
        entry.style.display = '';
      } else {
        entry.style.display = 'none';
      }
    });
  });
}

// ============================================================
// 9. Persistent Mini Player
// ============================================================
function initMiniPlayer() {
  const playerHTML = `
    <div id="miniPlayer" class="mini-player" role="region" aria-label="Audio Player">
      <div class="player-left">
        <img id="mp-art" class="player-art" src="" alt="Episode Artwork">
        <div class="player-meta">
          <div class="player-now-playing">🎧 Now Playing</div>
          <div id="mp-title" class="player-title">Episode Title</div>
          <div id="mp-speaker" class="player-speaker">Speaker Name</div>
        </div>
      </div>
      
      <div class="player-center">
        <div class="player-controls">
          <button class="player-btn" aria-label="Previous 15 seconds"><i class="fa-solid fa-backward-step"></i></button>
          <button id="mp-play" class="player-btn play-pause" aria-label="Play/Pause"><i class="fa-solid fa-play"></i></button>
          <button class="player-btn" aria-label="Next 15 seconds"><i class="fa-solid fa-forward-step"></i></button>
        </div>
        <div class="player-progress-container">
          <span id="mp-current" class="player-time current">0:00</span>
          <div class="player-progress-bar" id="mp-progress-bar" role="slider" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" tabindex="0">
            <div id="mp-progress-fill" class="player-progress-fill"></div>
          </div>
          <span id="mp-total" class="player-time">45:00</span>
        </div>
      </div>

      <div class="player-right">
        <button id="mp-speed" class="player-action-btn" aria-label="Playback Speed"><span style="font-size:12px;font-weight:bold;">1x</span></button>
        <button id="mp-bookmark" class="player-action-btn" aria-label="Bookmark Episode"><i class="fa-regular fa-bookmark"></i></button>
        <button id="mp-volume" class="player-action-btn" aria-label="Volume"><i class="fa-solid fa-volume-high"></i></button>
        <button id="mp-close" class="player-action-btn" aria-label="Close Player"><i class="fa-solid fa-xmark"></i></button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', playerHTML);

  const player = document.getElementById('miniPlayer');
  const btnPlay = document.getElementById('mp-play');
  const btnClose = document.getElementById('mp-close');
  const btnSpeed = document.getElementById('mp-speed');
  const btnBookmark = document.getElementById('mp-bookmark');
  const btnVolume = document.getElementById('mp-volume');
  const playIcon = btnPlay.querySelector('i');
  
  const elTitle = document.getElementById('mp-title');
  const elSpeaker = document.getElementById('mp-speaker');
  const elArt = document.getElementById('mp-art');
  const elFill = document.getElementById('mp-progress-fill');
  const elCurrent = document.getElementById('mp-current');

  let playInterval = null;
  let simulatedSeconds = 0;
  let isPlaying = false;
  let activeCardBtn = null;

  // Restore state from localStorage
  const state = JSON.parse(localStorage.getItem('tp_player_state') || 'null');
  
  if (state && state.active) {
    elTitle.textContent = state.title;
    elSpeaker.textContent = state.speaker;
    elArt.src = state.img;
    simulatedSeconds = state.time || 0;
    updateProgressUI();
    showPlayer();
    if (state.playing) {
      togglePlay(true);
    }
  }

  // Hook all play buttons globally
  document.querySelectorAll('button[aria-label^="Play"], .podcast-card-play button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Find closest card to extract data
      const card = btn.closest('.podcast-card') || btn.closest('.episode-hero') || btn.closest('.result-item');
      if (!card) return;
      
      let title = "Unknown Episode";
      let speaker = "Talkiepedia Guest";
      let img = "https://talkiepedia.forgealumnus.com/image/dummy-cover.jpg"; // fallback

      // Extract based on layout
      if (card.classList.contains('podcast-card')) {
        title = card.querySelector('h3')?.textContent.trim() || title;
        speaker = card.querySelector('.podcast-card-speaker')?.textContent.trim() || speaker;
        img = card.querySelector('img')?.src || img;
      } else if (card.classList.contains('episode-hero')) {
        title = card.querySelector('h1')?.textContent.trim() || title;
        speaker = card.querySelector('.guest-title')?.textContent.trim() || speaker;
        img = card.querySelector('.episode-artwork')?.src || img;
      }

      // Update UI & State
      elTitle.textContent = title;
      elSpeaker.textContent = speaker;
      elArt.src = img;
      simulatedSeconds = 0;
      
      // Reset previous card if exists
      if (activeCardBtn && activeCardBtn !== btn) {
        resetCardBtn(activeCardBtn);
      }
      activeCardBtn = btn;
      
      updateProgressUI();
      showPlayer();
      togglePlay(true);
    });
  });

  // Player Controls
  btnPlay.addEventListener('click', () => {
    togglePlay(!isPlaying);
  });

  btnClose.addEventListener('click', () => {
    togglePlay(false);
    player.classList.remove('visible');
    document.body.style.paddingBottom = '';
    localStorage.removeItem('tp_player_state');
  });

  // Secondary Controls Logic
  const speeds = ['1x', '1.2x', '1.5x', '2x'];
  let speedIdx = 0;
  btnSpeed.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    btnSpeed.querySelector('span').textContent = speeds[speedIdx];
  });

  btnBookmark.addEventListener('click', () => {
    const icon = btnBookmark.querySelector('i');
    if (icon.classList.contains('fa-regular')) {
      icon.classList.replace('fa-regular', 'fa-solid');
      btnBookmark.style.color = 'var(--primary-light)';
      icon.style.transform = 'scale(1.1)';
      setTimeout(() => icon.style.transform = 'scale(1)', 150);
    } else {
      icon.classList.replace('fa-solid', 'fa-regular');
      btnBookmark.style.color = '';
    }
  });

  let isMuted = false;
  btnVolume.addEventListener('click', () => {
    isMuted = !isMuted;
    const icon = btnVolume.querySelector('i');
    if (isMuted) {
      icon.className = 'fa-solid fa-volume-xmark';
    } else {
      icon.className = 'fa-solid fa-volume-high';
    }
  });

  // Functions
  function togglePlay(forcePlay) {
    isPlaying = forcePlay;
    if (isPlaying) {
      playIcon.className = 'fa-solid fa-pause';
      elArt.classList.add('is-playing');
      startSimulation();
      if (activeCardBtn) setCardBtnPlaying(activeCardBtn);
    } else {
      playIcon.className = 'fa-solid fa-play';
      elArt.classList.remove('is-playing');
      stopSimulation();
      if (activeCardBtn) resetCardBtn(activeCardBtn);
    }
    saveState();
  }

  function setCardBtnPlaying(btn) {
    const icon = btn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-pause';
    
    // Add Listening indicator if not present
    const container = btn.closest('.podcast-card-play') || btn.parentElement;
    if (container && !container.querySelector('.listening-indicator')) {
      const indicator = document.createElement('span');
      indicator.className = 'listening-indicator';
      indicator.textContent = 'Listening...';
      indicator.style.fontSize = '12px';
      indicator.style.color = 'var(--primary-light)';
      indicator.style.fontWeight = '600';
      indicator.style.marginLeft = '12px';
      // Append right after the button
      btn.insertAdjacentElement('afterend', indicator);
    }
  }

  function resetCardBtn(btn) {
    const icon = btn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-play';
    
    const container = btn.closest('.podcast-card-play') || btn.parentElement;
    if (container) {
      const indicator = container.querySelector('.listening-indicator');
      if (indicator) indicator.remove();
    }
  }

  function showPlayer() {
    player.classList.add('visible');
    // Ensure body doesn't overlap footer content
    document.body.style.paddingBottom = '80px';
  }

  function saveState() {
    localStorage.setItem('tp_player_state', JSON.stringify({
      active: true,
      playing: isPlaying,
      title: elTitle.textContent,
      speaker: elSpeaker.textContent,
      img: elArt.src,
      time: simulatedSeconds
    }));
  }

  function startSimulation() {
    stopSimulation();
    playInterval = setInterval(() => {
      simulatedSeconds++;
      if (simulatedSeconds >= 45 * 60) simulatedSeconds = 0; // loop at 45 mins
      updateProgressUI();
      // save state periodically
      if (simulatedSeconds % 5 === 0) saveState();
    }, 1000);
  }

  function stopSimulation() {
    if (playInterval) clearInterval(playInterval);
  }

  function updateProgressUI() {
    const totalSeconds = 45 * 60; // 45 min dummy length
    const percent = Math.min((simulatedSeconds / totalSeconds) * 100, 100);
    elFill.style.width = `${percent}%`;
    
    const m = Math.floor(simulatedSeconds / 60);
    const s = simulatedSeconds % 60;
    elCurrent.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }
}
