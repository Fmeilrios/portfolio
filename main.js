(function () {
  const THEMES = ['light', 'dark', 'reader', 'black'];

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t === 'light' ? '' : t);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === t);
    });
    localStorage.setItem('resume-theme', t);
  }

  function staggerElements() {
    const eyebrow   = document.querySelectorAll('.eyebrow');
    const tagline   = document.querySelectorAll('.tagline');
    const contact   = document.querySelectorAll('.contact-row');
    const labels    = document.querySelectorAll('.section-label');
    const entries   = document.querySelectorAll('.entry');
    const tags      = document.querySelectorAll('.tag');
    const interests = document.querySelectorAll('.interest-item');
    const avail     = document.querySelectorAll('.avail-detail');

    [eyebrow, tagline, contact, labels, entries, tags, interests, avail].forEach(group =>
      group.forEach(el => { el.classList.remove('visible'); void el.offsetWidth; })
    );

    eyebrow.forEach(el   => setTimeout(() => el.classList.add('visible'), 40));
    tagline.forEach(el   => setTimeout(() => el.classList.add('visible'), 80));
    contact.forEach(el   => setTimeout(() => el.classList.add('visible'), 110));
    labels.forEach((el, i)    => setTimeout(() => el.classList.add('visible'), 150 + i * 50));
    entries.forEach((el, i)   => setTimeout(() => el.classList.add('visible'), 200 + i * 70));
    interests.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 350 + i * 60));
    avail.forEach((el, i)     => setTimeout(() => el.classList.add('visible'), 350 + i * 60));
    tags.forEach((el, i)      => setTimeout(() => el.classList.add('visible'), 450 + i * 40));
  }

  function initContact() {
    const openBtn = document.getElementById('open-contact');
    const modal = document.getElementById('contact-modal');
    const closeBtn = document.getElementById('modal-close');
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    const error = document.getElementById('form-error');
    if (!openBtn || !modal) return;

    function openModal() { modal.removeAttribute('hidden'); document.body.style.overflow = 'hidden'; }
    function closeModal() { modal.hidden = true; document.body.style.overflow = ''; }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submit = form.querySelector('.form-submit');
      submit.disabled = true;
      error.hidden = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          form.hidden = true;
          success.removeAttribute('hidden');
        } else {
          error.removeAttribute('hidden');
          submit.disabled = false;
        }
      } catch (_) {
        error.removeAttribute('hidden');
        submit.disabled = false;
      }
    });
  }

  function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const dropdown = document.getElementById('nav-dropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = !dropdown.hidden;
      dropdown.hidden = open;
      toggle.classList.toggle('active', !open);
    });

    dropdown.addEventListener('click', function (e) {
      const item = e.target.closest('.nav-item');
      if (!item) return;
      e.preventDefault();
      const target = document.querySelector(item.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      dropdown.hidden = true;
      toggle.classList.remove('active');
    });

    document.addEventListener('click', function () {
      dropdown.hidden = true;
      toggle.classList.remove('active');
    });
  }

  function init() {
    let saved = localStorage.getItem('resume-theme');
    applyTheme(THEMES.includes(saved) ? saved : getSystemTheme());

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
        staggerElements();
      });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('resume-theme'))
        applyTheme(e.matches ? 'dark' : 'light');
    });

    initContact();
    initMenu();
    staggerElements();
  }

  window.onLangChange = staggerElements;
  window.staggerElements = staggerElements;

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
