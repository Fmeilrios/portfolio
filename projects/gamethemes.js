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

  function initPill() {
    const toggle = document.getElementById('menu-toggle');
    const wrap   = document.querySelector('.switcher-wrap');
    if (!toggle || !wrap) return;

    function syncPill() {
      wrap.classList.toggle('scrolled', window.scrollY > 80);
    }

    if (localStorage.getItem('resume-pill-collapsed') === '1') {
      wrap.classList.add('scrolled');
    }

    toggle.addEventListener('click', function () {
      if (wrap.classList.contains('scrolled')) {
        wrap.classList.remove('scrolled');
        toggle.classList.add('active');
        localStorage.setItem('resume-pill-collapsed', '0');
      } else {
        wrap.classList.add('scrolled');
        toggle.classList.remove('active');
        localStorage.setItem('resume-pill-collapsed', '1');
      }
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        wrap.classList.add('scrolled');
        toggle.classList.remove('active');
      }
    }, { passive: true });
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
    initPill();
    staggerIn();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
