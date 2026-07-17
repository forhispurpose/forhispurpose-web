document.addEventListener('DOMContentLoaded', function () {
  // ---- Mega menu (hamburger) ----
  var menuToggle = document.getElementById('menuToggle');
  var megaMenu = document.getElementById('megaMenu');

  function closeMenu() {
    if (megaMenu) megaMenu.classList.remove('open');
    if (menuToggle) menuToggle.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openMenu() {
    if (megaMenu) megaMenu.classList.add('open');
    if (menuToggle) menuToggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (menuToggle && megaMenu) {
    menuToggle.addEventListener('click', function () {
      var isOpen = megaMenu.classList.contains('open');
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });
    // Close when a link inside the menu is clicked
    megaMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ---- Dark mode toggle ----
  var themeToggle = document.getElementById('themeToggle');
  var THEME_KEY = 'fhp-theme';
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      if (themeToggle) themeToggle.innerHTML = '&#9788;'; // sun
    } else {
      document.body.classList.remove('dark-mode');
      if (themeToggle) themeToggle.innerHTML = '&#9789;'; // moon
    }
  }
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
  } catch (e) { /* localStorage unavailable — ignore, defaults to light */ }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isDark = document.body.classList.contains('dark-mode');
      var next = isDark ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  // Highlight active nav link based on current page
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
  });

  // Footer year
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ---- Form handling: submits to the backend API if configured, otherwise ----
  // ---- falls back to a local "thank you" so the prototype still feels alive. ----
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    var endpoint = form.getAttribute('data-endpoint'); // e.g. "/api/newsletter"
    var successEl = form.parentElement.querySelector('.form-success');
    var submitBtn = form.querySelector('button[type="submit"]');

    function showError(message) {
      var errorEl = form.parentElement.querySelector('.form-error');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.style.cssText = 'margin-top:12px;font-size:.85rem;font-weight:600;color:#B3261E;';
        form.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var apiBase = window.FHP_API_BASE || '';
      var isConfigured = endpoint && apiBase && apiBase.indexOf('YOUR-USERNAME') === -1;

      if (!isConfigured) {
        // Backend not wired up yet (or this form has no endpoint) — keep the demo experience.
        if (successEl) { successEl.style.display = 'block'; }
        form.reset();
        return;
      }

      // Serialize every field by its name (falls back to id) into a plain object.
      var payload = {};
      form.querySelectorAll('input, select, textarea').forEach(function (field) {
        var key = field.name || field.id;
        if (!key) return;
        payload[key] = field.value;
      });

      if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.originalText = submitBtn.textContent; submitBtn.textContent = 'Sending…'; }

      fetch(apiBase + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          if (!result.ok) throw new Error((result.data && result.data.error) || 'Something went wrong.');
          if (successEl) { successEl.style.display = 'block'; }
          form.reset();
        })
        .catch(function (err) {
          showError(err.message || 'Could not submit right now — please try again shortly.');
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.originalText; }
        });
    });
  });

  // Simple reveal-on-scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      io.observe(el);
    });
  }
});
