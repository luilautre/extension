// Content script pour Firefox : observe la page, détecte .js-timeline puis crée une vue simplifiée
(function () {
  'use strict';

  // Option : mettre true pour masquer la timeline originale (remplace l'affichage)
  const HIDE_ORIGINAL = false;

  const TIMELINE_SELECTOR = '.js-timeline';
  const CONTAINER_SELECTOR = '.js-taf-container';

  function safeText(el) {
    return el ? el.textContent.trim().replace(/\s+/g, ' ') : '';
  }

  function buildCompactCard(data) {
    const card = document.createElement('div');
    card.className = 'ext-compact-card';

    const header = document.createElement('div');
    header.className = 'ext-card-header';

    const title = document.createElement('div');
    title.className = 'ext-title';
    title.innerHTML = `<strong>${escapeHtml(data.subject)}</strong> — ${escapeHtml(data.title)}`;

    const meta = document.createElement('div');
    meta.className = 'ext-meta';
    meta.textContent = data.date || '';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'ext-toggle';
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'Détails';
    toggleBtn.addEventListener('click', () => {
      details.classList.toggle('hidden');
      toggleBtn.textContent = details.classList.contains('hidden') ? 'Détails' : 'Fermer';
    });

    header.appendChild(title);
    header.appendChild(meta);
    header.appendChild(toggleBtn);

    const details = document.createElement('div');
    details.className = 'ext-details hidden';
    if (data.description) {
      const desc = document.createElement('div');
      desc.className = 'ext-desc';
      desc.innerHTML = escapeHtmlPreserveLineBreaks(data.description);
      details.appendChild(desc);
    }

    if (data.files && data.files.length) {
      const files = document.createElement('ul');
      files.className = 'ext-files';
      data.files.forEach(f => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = f.href;
        a.textContent = f.title || f.href;
        a.target = '_blank';
        li.appendChild(a);
        files.appendChild(li);
      });
      details.appendChild(files);
    }

    if (data.markDoneHref) {
      const actions = document.createElement('div');
      actions.className = 'ext-actions';
      const markBtn = document.createElement('a');
      markBtn.className = 'btn-mark-done';
      markBtn.href = data.markDoneHref;
      markBtn.textContent = 'Déclarer fait';
      // Laisser le lien agir comme à l'origine (navigation ou appel AJAX selon le site)
      actions.appendChild(markBtn);
      details.appendChild(actions);
    }

    card.appendChild(header);
    card.appendChild(details);
    return card;
  }

  // helpers anti-XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }
  function escapeHtmlPreserveLineBreaks(str) {
    return escapeHtml(str).replace(/\n/g, '<br/>');
  }

  function extractDataFromContainer(container) {
    const subjectEl = container.querySelector('.p-like.b-like') || container.querySelector('.h6-like') || container.querySelector('.slug.slug--xs') || container.querySelector('.p-like.slug');
    const linkEl = container.querySelector('.js-taf__modal-trigger') || container.querySelector('a');
    const dateEl = container.closest('li') ? container.closest('li').querySelector('.timeline__date') : null;
    const descEl = container.querySelector('.js-taf__modal-content .panel') || container.querySelector('.js-taf__modal-content') || container.querySelector('.js-taf__content p');

    const files = Array.from(container.querySelectorAll('.jumbofiles__file-name, .jumbofiles__files a'))
      .map(a => ({ title: safeText(a), href: a.href || a.getAttribute('href') }))
      .filter(f => f.href);

    const markDone = container.querySelector('.js-taf__btn-marquer-fait-non-fait') || container.querySelector('a[href*="TRAVAIL_FAIT"], a.js-async');

    return {
      id: container.getAttribute('data-id') || '',
      subject: safeText(subjectEl),
      title: safeText(linkEl),
      date: safeText(dateEl),
      description: descEl ? safeText(descEl) : '',
      files,
      markDoneHref: markDone ? (markDone.href || markDone.getAttribute('href')) : null
    };
  }

  function transformTimeline(timeline) {
    if (!timeline) return;
    if (timeline.querySelector('.ext-compact-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'ext-compact-wrapper';

    const h = document.createElement('div');
    h.className = 'ext-header';
    h.innerHTML = '<h3>Vue simplifiée des devoirs</h3><p class="ext-sub">Cliquer "Détails" pour développer chaque devoir.</p>';
    wrapper.appendChild(h);

    const list = document.createElement('div');
    list.className = 'ext-list';

    const containers = Array.from(timeline.querySelectorAll(CONTAINER_SELECTOR));
    if (!containers.length) {
      const msg = document.createElement('div');
      msg.className = 'ext-empty';
      msg.textContent = 'Aucun élément trouvé (le contenu peut être chargé dynamiquement).';
      list.appendChild(msg);
    }

    containers.forEach(c => {
      const data = extractDataFromContainer(c);
      const card = buildCompactCard(data);
      list.appendChild(card);
    });

    wrapper.appendChild(list);
    timeline.parentNode.insertBefore(wrapper, timeline);

    if (HIDE_ORIGINAL) {
      timeline.style.display = 'none';
    }
  }

  function waitForTimeline() {
    const existing = document.querySelector(TIMELINE_SELECTOR);
    if (existing) transformTimeline(existing);

    // Observer pour contenu chargé dynamiquement
    const obs = new MutationObserver(() => {
      const tl = document.querySelector(TIMELINE_SELECTOR);
      if (tl) transformTimeline(tl);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  try {
    waitForTimeline();
  } catch (err) {
    console.error('modify_timeline.js error', err);
  }
})();
