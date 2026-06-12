(function () {
  const LANG_KEY = 'resume-lang';

  const T = {
    de: {
      // resume page
      'resume.title':         'Miro Richhardt – Informatikstudent',
      'resume.eyebrow':       'Informatikstudent · B.Sc.',
      'resume.tagline':       'Informatikstudent mit Leidenschaft für Fantasy-Literatur und Videospiele – mit dem Ziel, Spieleentwicklung als Karriere aufzubauen.',
      'resume.on-request':    'auf Anfrage',
      'section.education':    'Studium',
      'edu1.date':            'Okt. 2026 · geplant',
      'edu1.badge':           'Wechsel zum Wintersemester',
      'edu2.note':            'Wechsel aufgrund Umzug nach Kaarst',
      'edu3.title':           'Allgemeine Hochschulreife',
      'section.projects':     'Projekte',
      'sf.li1':               'Idle-Game rund um den Aufbau einer eigenen Serverinfrastruktur',
      'sf.li2':               '8 Hardware-Stufen von Raspberry Pi bis Datacenter',
      'sf.li3':               'Upgrade-System mit Multiplikatoren und Auto-Sell-Mechanik',
      'dc.li1':               'Rundenbasiertes Dungeon-Spiel im ASCII-Stil, vollständig im Browser',
      'dc.li2':               'Prozedurale Raumgenerierung mit Korridoren und 3 Etagen',
      'dc.li3':               'Gegner-KI, Kampfsystem und Gegenstandsmechanik',
      'section.work':         'Berufserfahrung',
      'work.title':           'Küchenhilfe',
      'work.sub':             'Nebenjob neben Schule und Studium',
      'work.li1':             'Zuverlässige Arbeit in einem schnellen, teamorientierten Umfeld',
      'work.li2':             'Verantwortungsbewusstsein und Durchhaltevermögen über mehrere Jahre',
      'work.li3':             'Koordination von Abläufen unter Zeitdruck',
      'section.skills':       'Skills',
      'skills.prog':          'Programmierung',
      'skills.tools':         'Tools & Sprachen',
      'section.interests':    'Interessen',
      'interest.games':       'Videospiele & Game Dev',
      'interest.music':       'Musik',
      'interest.fantasy':     'Fantasy-Literatur',
      'section.avail':        'Verfügbarkeit',
      'avail.detail':         'Kaarst · Mo–Sa<br>max. 17 Std./Woche',
      'avail.badge':          'Aktiv auf Jobsuche',
      // dungeon page
      'dungeon.back':         '← zurück zum lebenslauf',
      'dungeon.hint.keys':    'WASD / Pfeiltasten',
      'dungeon.hint.player':  'Du',
      'dungeon.hint.enemies': 'Feinde',
      'dungeon.hint.flask':   'Heiltrank',
      'dungeon.hint.atk':     'ATK-Drop',
      'dungeon.hint.stairs':  'Treppe',
      'dungeon.hint.restart': 'R = Neustart',
      // dungeon game messages
      'game.welcome':         'Willkommen! Erkunde den Dungeon. R = Neustart.',
      'game.enemy.killed':    dmg => `Feind besiegt! (+${dmg} Schaden)`,
      'game.atk.drop':        'Ein Angriffsbuff fiel zu Boden!',
      'game.enemy.hit':       (dmg, hp) => `Treffer! ${dmg} Schaden → Feind HP: ${hp}`,
      'game.floor.next':      floor => `Du steigst tiefer hinab... Etage ${floor}.`,
      'game.win':             '★ Dungeon bezwungen! Du hast gewonnen! (R = Neustart)',
      'game.overheal':        (ov, max) => `Überheilung! Max HP +${ov} (jetzt ${max})`,
      'game.heal':            heal => `Heiltrank! +${heal} HP`,
      'game.atk.buff':        (atk, tot) => `Angriffsbuff! ATK +${atk} (jetzt ${tot})`,
      'game.dead':            '† Du bist gestorben. (R = Neustart)',
      'game.enemy.attack':    dmg => `Feind trifft dich! −${dmg} HP`,
      'game.stats':           (bar, hp, max, atk, floor, n) => `HP [${bar}] ${hp}/${max}   ATK ${atk}   Etage ${floor}/3   Feinde ${n}`,
      // footer & contact
      'footer.impressum':  'Impressum',
      'footer.contact':    'Kontakt',
      'contact.title':     'Kontakt',
      'contact.name':      'Name',
      'contact.email':     'E-Mail',
      'contact.message':   'Nachricht',
      'contact.send':      'Senden',
      'contact.success':   'Nachricht gesendet! Ich melde mich bald.',
      'contact.error':     'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
      // serverfarm page
      'sf.back':              '← zurück zum lebenslauf',
      'sf.reset.title':       'Fortschritt zurücksetzen',
      'sf.confirm.reset':     'Fortschritt wirklich zurücksetzen?',
      'sf.farm.label':        'Deine Farm',
      'sf.farm.empty':        'Leer — kaufe deinen ersten Server',
      'sf.section.hardware':  'Hardware',
      'sf.section.upgrades':  'Upgrades',
    },
    en: {
      // resume page
      'resume.title':         'Miro Richhardt – CS Student',
      'resume.eyebrow':       'CS Student · B.Sc.',
      'resume.tagline':       'Computer science student passionate about fantasy literature and video games — aiming to build a career in game development.',
      'resume.on-request':    'on request',
      'section.education':    'Education',
      'edu1.date':            'Oct. 2026 · planned',
      'edu1.badge':           'Transfer in winter semester',
      'edu2.note':            'Transfer due to relocation to Kaarst',
      'edu3.title':           'German Abitur (A-levels)',
      'section.projects':     'Projects',
      'sf.li1':               'Idle game about building your own server infrastructure',
      'sf.li2':               '8 hardware tiers from Raspberry Pi to Data Center',
      'sf.li3':               'Upgrade system with multipliers and auto-sell mechanics',
      'dc.li1':               'Turn-based ASCII dungeon game, runs entirely in the browser',
      'dc.li2':               'Procedural room generation with corridors across 3 floors',
      'dc.li3':               'Enemy AI, combat system, and item mechanics',
      'section.work':         'Work Experience',
      'work.title':           'Kitchen Assistant',
      'work.sub':             'Part-time job alongside school and university',
      'work.li1':             'Reliable work in a fast-paced, team-oriented environment',
      'work.li2':             'Accountability and perseverance over several years',
      'work.li3':             'Coordinating workflows under time pressure',
      'section.skills':       'Skills',
      'skills.prog':          'Programming',
      'skills.tools':         'Tools & Languages',
      'section.interests':    'Interests',
      'interest.games':       'Video Games & Game Dev',
      'interest.music':       'Music',
      'interest.fantasy':     'Fantasy Literature',
      'section.avail':        'Availability',
      'avail.detail':         'Kaarst · Mon–Sat<br>max. 17 hrs/week',
      'avail.badge':          'Actively job seeking',
      // dungeon page
      'dungeon.back':         '← back to resume',
      'dungeon.hint.keys':    'WASD / Arrow keys',
      'dungeon.hint.player':  'You',
      'dungeon.hint.enemies': 'Enemies',
      'dungeon.hint.flask':   'Health potion',
      'dungeon.hint.atk':     'ATK drop',
      'dungeon.hint.stairs':  'Stairs',
      'dungeon.hint.restart': 'R = Restart',
      // dungeon game messages
      'game.welcome':         'Welcome! Explore the dungeon. R = Restart.',
      'game.enemy.killed':    dmg => `Enemy defeated! (+${dmg} damage)`,
      'game.atk.drop':        'An attack buff dropped!',
      'game.enemy.hit':       (dmg, hp) => `Hit! ${dmg} damage → Enemy HP: ${hp}`,
      'game.floor.next':      floor => `You descend deeper... Floor ${floor}.`,
      'game.win':             '★ Dungeon conquered! You win! (R = Restart)',
      'game.overheal':        (ov, max) => `Overheal! Max HP +${ov} (now ${max})`,
      'game.heal':            heal => `Health potion! +${heal} HP`,
      'game.atk.buff':        (atk, tot) => `Attack buff! ATK +${atk} (now ${tot})`,
      'game.dead':            '† You died. (R = Restart)',
      'game.enemy.attack':    dmg => `Enemy hits you! −${dmg} HP`,
      'game.stats':           (bar, hp, max, atk, floor, n) => `HP [${bar}] ${hp}/${max}   ATK ${atk}   Floor ${floor}/3   Enemies ${n}`,
      // footer & contact
      'footer.impressum':  'Legal Notice',
      'footer.contact':    'Contact',
      'contact.title':     'Contact',
      'contact.name':      'Name',
      'contact.email':     'Email',
      'contact.message':   'Message',
      'contact.send':      'Send',
      'contact.success':   'Message sent! I\'ll get back to you soon.',
      'contact.error':     'Something went wrong. Please try again.',
      // serverfarm page
      'sf.back':              '← back to resume',
      'sf.reset.title':       'Reset progress',
      'sf.confirm.reset':     'Really reset all progress?',
      'sf.farm.label':        'Your Farm',
      'sf.farm.empty':        'Empty — buy your first server',
      'sf.section.hardware':  'Hardware',
      'sf.section.upgrades':  'Upgrades',
    },
  };

  let lang = localStorage.getItem(LANG_KEY) ||
    (navigator.language && navigator.language.startsWith('de') ? 'de' : 'en');

  window.t = function (key) {
    const args = Array.prototype.slice.call(arguments, 1);
    const val = (T[lang] || T.de)[key] != null ? (T[lang] || T.de)[key] : (T.de[key] != null ? T.de[key] : key);
    return typeof val === 'function' ? val.apply(null, args) : val;
  };

  function applyTranslations() {
    var titleKey = document.documentElement.dataset.titleKey;
    if (titleKey) document.title = window.t(titleKey);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = window.t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = window.t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = window.t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    if (typeof onLangChange === 'function') onLangChange();
  }

  window.applyLang = function (newLang) {
    lang = newLang;
    window.currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    applyTranslations();
  };

  window.currentLang = lang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.applyLang(lang, false); });
  } else {
    window.applyLang(lang, false);
  }
})();
