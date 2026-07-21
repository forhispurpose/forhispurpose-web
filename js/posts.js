// Fetches devotionals, articles, or testimonies from the backend and renders
// them into a target element. Used by daily-devotion.html, articles.html,
// testimonies.html, and the homepage previews.
//
// Single feed on a page: set window.FHP_POSTS_TARGET, window.FHP_POSTS_TYPE
// (and optionally window.FHP_POSTS_LIMIT) before this script runs.
//
// Multiple feeds on the same page (e.g. the homepage's devotions + testimony
// previews): set window.FHP_POSTS_FEEDS to an array instead, e.g.
//   window.FHP_POSTS_FEEDS = [
//     { target: 'devoPreview', type: 'devotional', limit: 3 },
//     { target: 'testimonyPreview', type: 'testimony', limit: 3 }
//   ];
document.addEventListener('DOMContentLoaded', function () {
  var feeds = window.FHP_POSTS_FEEDS;
  if (!feeds || !feeds.length) {
    if (window.FHP_POSTS_TARGET && window.FHP_POSTS_TYPE) {
      feeds = [{ target: window.FHP_POSTS_TARGET, type: window.FHP_POSTS_TYPE, limit: window.FHP_POSTS_LIMIT || null }];
    } else {
      feeds = [];
    }
  }
  if (!feeds.length) return;

  var apiBase = window.FHP_API_BASE || '';

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function excerpt(body, max) {
    var text = String(body || '').trim();
    if (text.length <= max) return text;
    return text.slice(0, max).trim() + '…';
  }

  function loadFeed(feed) {
    var el = document.getElementById(feed.target);
    if (!el) return;
    var type = feed.type;
    var limit = feed.limit || null;

    fetch(apiBase + '/api/posts?type=' + encodeURIComponent(type))
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (result.ok && result.posts && limit) {
          result.posts = result.posts.slice(0, limit);
        }
        if (!result.ok || !result.posts || !result.posts.length) {
          var emptyMsg = type === 'devotional' ? 'No devotions posted yet — check back soon.'
            : type === 'testimony' ? 'No testimonies posted yet — check back soon.'
            : type === 'episode' ? 'No episodes posted yet — check back soon.'
            : 'No articles posted yet — check back soon.';
          el.innerHTML = '<p style="grid-column:1/-1; color:var(--ink-soft); text-align:center;">' + emptyMsg + '</p>';
          return;
        }
        el.innerHTML = '';
        result.posts.forEach(function (post) {
          var card = document.createElement('div');
          if (type === 'testimony') {
            card.className = 'quote-card reveal';
            card.innerHTML =
              '<p>&ldquo;' + escapeHtml(post.body) + '&rdquo;</p>' +
              '<div class="quote-name mt-lg">— ' + escapeHtml(post.title) + '</div>' +
              (post.author ? '<div class="quote-role">' + escapeHtml(post.author) + '</div>' : '');
          } else if (type === 'episode') {
            card.className = 'devo-card reveal';
            card.innerHTML =
              '<div class="devo-media"><span>' + formatDate(post.published_at) + '</span></div>' +
              '<div class="devo-body">' +
              (post.author ? '<span class="devo-tag">' + escapeHtml(post.author) + '</span>' : '') +
              '<h3>' + escapeHtml(post.title) + '</h3>' +
              '<p>' + escapeHtml(excerpt(post.body, 140)) + '</p>' +
              (post.link ? '<a href="' + escapeHtml(post.link) + '" target="_blank" rel="noopener" class="card-link">Listen / Watch →</a>' : '') +
              '</div>';
          } else {
            card.className = 'devo-card reveal';
            var tag = post.scripture_ref ? escapeHtml(post.scripture_ref) : formatDate(post.published_at);
            card.innerHTML =
              '<div class="devo-media"><span>' + formatDate(post.published_at) + '</span></div>' +
              '<div class="devo-body">' +
              '<span class="devo-tag">' + tag + '</span>' +
              '<h3>' + escapeHtml(post.title) + '</h3>' +
              '<p>' + escapeHtml(excerpt(post.body, 140)) + '</p>' +
              '<div class="devo-meta">' + formatDate(post.published_at) + '</div>' +
              '</div>';
          }
          el.appendChild(card);
        });
      })
      .catch(function () {
        el.innerHTML = '<p style="grid-column:1/-1; color:var(--ink-soft); text-align:center;">Could not load right now — please refresh.</p>';
      });
  }

  feeds.forEach(loadFeed);
});
