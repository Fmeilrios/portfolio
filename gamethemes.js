(function () {
  const THEMES = ['light', 'dark', 'reader', 'black'];

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    localStorage.setItem('resume-theme', theme);
    if (typeof onThemeChange === 'function') onThemeChange();
  }

  function staggerIn() {
    const els = document.querySelectorAll('.game-fade');
    els.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 80 + i * 100));
  }

  function init() {
    const saved = localStorage.getItem('resume-theme');
    const theme = saved && THEMES.includes(saved) ? saved : getSystemTheme();
    applyTheme(theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('resume-theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
    staggerIn();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
