// Fetches devotionals or articles from the backend and renders them into
// a target element. Used by daily-devotion.html and articles.html.
// Expects a container with id given by window.FHP_POSTS_TARGET and a
// window.FHP_POSTS_TYPE of "devotional" or "article".
document.addEventListener('DOMContentLoaded', function () {
  var targetId = window.FHP_POSTS_TARGET;
  var type = window.FHP_POSTS_TYPE;
  if (!targetId || !type) return;

  var el = document.getElementById(targetId);
  if (!el) return;

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

  var limit = window.FHP_POSTS_LIMIT || null;

  fetch(apiBase + '/api/posts?type=' + encodeURIComponent(type))
    .then(function (res) { return res.json(); })
    .then(function (result) {
      if (result.ok && result.posts && limit) {
        result.posts = result.posts.slice(0, limit);
      }
      if (!result.ok || !result.posts || !result.posts.length) {
        el.innerHTML = '<p style="grid-column:1/-1; color:var(--ink-soft); text-align:center;">' +
          (type === 'devotional'
            ? 'No devotions posted yet — check back soon.'
            : 'No articles posted yet — check back soon.') +
          '</p>';
        return;
      }
      el.innerHTML = '';
      result.posts.forEach(function (post) {
        var card = document.createElement('div');
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
        el.appendChild(card);
      });
    })
    .catch(function () {
      el.innerHTML = '<p style="grid-column:1/-1; color:var(--ink-soft); text-align:center;">Could not load right now — please refresh.</p>';
    });
});
