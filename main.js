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
    const entries = document.querySelectorAll('.entry');
    const tags = document.querySelectorAll('.tag');

    entries.forEach(el => { el.classList.remove('visible'); void el.offsetWidth; });
    tags.forEach(el => { el.classList.remove('visible'); void el.offsetWidth; });

    entries.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 150 + i * 80));
    tags.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 400 + i * 50));
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

    staggerElements();
  }

  window.onLangChange = staggerElements;

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
