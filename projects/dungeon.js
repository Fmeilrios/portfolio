const MAP_W = 60;
const MAP_H = 22;

let map, player, enemies, items, messages, floor, gameOver;

function rnd(n) { return Math.floor(Math.random() * n); }

function init() {
  floor = 1;
  player = { x: 0, y: 0, hp: 30, maxHp: 30, atk: 5 };
  messages = [t('game.welcome')];
  gameOver = false;
  generateFloor();
  render();
}

function generateFloor() {
  map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill('#'));
  enemies = [];
  items = [];

  const rooms = [];
  const target = 5 + rnd(4);

  for (let attempts = 0; attempts < target * 12 && rooms.length < target; attempts++) {
    const w = 4 + rnd(8), h = 3 + rnd(5);
    const x = 1 + rnd(MAP_W - w - 2);
    const y = 1 + rnd(MAP_H - h - 2);

    const overlaps = rooms.some(r =>
      x < r.x + r.w + 2 && x + w + 2 > r.x &&
      y < r.y + r.h + 2 && y + h + 2 > r.y
    );
    if (overlaps) continue;

    rooms.push({ x, y, w, h });
    for (let ry = y; ry < y + h; ry++)
      for (let rx = x; rx < x + w; rx++)
        map[ry][rx] = '.';
  }

  // connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i-1], b = rooms[i];
    const ax = Math.floor(a.x + a.w/2), ay = Math.floor(a.y + a.h/2);
    const bx = Math.floor(b.x + b.w/2), by = Math.floor(b.y + b.h/2);
    let cx = ax;
    while (cx !== bx) { map[ay][cx] = '.'; cx += bx > cx ? 1 : -1; }
    let cy = ay;
    while (cy !== by) { map[cy][bx] = '.'; cy += by > cy ? 1 : -1; }
    map[by][bx] = '.';
  }

  const first = rooms[0];
  player.x = Math.floor(first.x + first.w/2);
  player.y = Math.floor(first.y + first.h/2);

  const last = rooms.length > 1 ? rooms[rooms.length - 1] : null;
  if (last) map[Math.floor(last.y + last.h/2)][Math.floor(last.x + last.w/2)] = '≡';

  const enemyStats = {
    'o': f => ({ hp: 5  + f*2, atk: 1 + f }),
    '<': f => ({ hp: 9  + f*3, atk: 2 + f }),
    '+': f => ({ hp: 14 + f*4, atk: 3 + f }),
    '*': f => ({ hp: 20 + f*5, atk: 4 + f + rnd(2) }),
  };

  for (let i = 1; i < rooms.length - 1; i++) {
    const r = rooms[i];
    const count = 1 + rnd(1 + floor);
    for (let j = 0; j < count; j++) {
      const sym = ['o', '<', '+', '*'][Math.min(floor - 1 + rnd(2), 3)];
      const stats = enemyStats[sym](floor);
      enemies.push({
        x: r.x + 1 + rnd(Math.max(1, r.w-2)),
        y: r.y + 1 + rnd(Math.max(1, r.h-2)),
        hp: stats.hp, maxHp: stats.hp, atk: stats.atk, sym
      });
    }
  }

  for (let i = 1; i < rooms.length; i++) {
    if (Math.random() < 0.55) {
      const r = rooms[i];
      items.push({ x: r.x + rnd(r.w), y: r.y + rnd(r.h), sym: '§', heal: 8 + rnd(6) });
    }
  }
}

function render() {
  const display = map.map(row => [...row]);
  items.forEach(it => { display[it.y][it.x] = it.sym; });
  enemies.forEach(e => { display[e.y][e.x] = e.sym; });
  display[player.y][player.x] = '☺';

  const cs = getComputedStyle(document.documentElement);
  const cv = n => cs.getPropertyValue(n).trim();
  const colors = {
    '☺': cv('--color-blue'),
    'o': cv('--color-accent'), '<': cv('--color-accent'),
    '+': cv('--color-accent'), '*': cv('--color-accent'),
    '§': cv('--color-green'),
    '^': cv('--color-gold'),
    '≡': cv('--color-text'),
  };

  const esc = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  const cell = c => {
    const s = esc[c] || c;
    return colors[c] ? `<span style="color:${colors[c]}">${s}</span>` : s;
  };

  const hintColors = {
    'hint-player':  cv('--color-blue'),
    'hint-enemies': cv('--color-accent'),
    'hint-flask':   cv('--color-green'),
    'hint-atk':     cv('--color-gold'),
    'hint-stairs':  cv('--color-text'),
  };
  for (const [id, color] of Object.entries(hintColors)) {
    const el = document.getElementById(id);
    if (el) el.style.color = color;
  }

  document.getElementById('map').innerHTML =
    display.map(row => row.map(cell).join('')).join('\n');

  const filled = Math.round((player.hp / player.maxHp) * 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  document.getElementById('stats').textContent =
    t('game.stats', bar, player.hp, player.maxHp, player.atk, floor, enemies.length);

  document.getElementById('log').textContent = messages.slice(-4).join('\n');
}

function tryMove(dx, dy) {
  if (gameOver) return;
  const nx = player.x + dx, ny = player.y + dy;
  if (ny < 0 || ny >= MAP_H || nx < 0 || nx >= MAP_W) return;
  if (map[ny][nx] === '#') return;

  const enemy = enemies.find(e => e.x === nx && e.y === ny);
  if (enemy) {
    const dmg = player.atk + rnd(4);
    enemy.hp -= dmg;
    if (enemy.hp <= 0) {
      const ex = enemy.x, ey = enemy.y;
      enemies = enemies.filter(e => e !== enemy);
      messages.push(t('game.enemy.killed', dmg));
      if (Math.random() < 0.4) {
        items.push({ x: ex, y: ey, sym: '^', atk: 1 });
        messages.push(t('game.atk.drop'));
      }
    } else {
      messages.push(t('game.enemy.hit', dmg, enemy.hp));
    }
    enemyTurn();
    render();
    return;
  }

  if (map[ny][nx] === '≡') {
    if (floor >= 3) {
      messages.push(t('game.win'));
      gameOver = true;
      player.x = nx; player.y = ny;
      render();
      return;
    }
    floor++;
    messages.push(t('game.floor.next', floor));
    generateFloor();
    render();
    return;
  }

  player.x = nx;
  player.y = ny;

  const item = items.find(it => it.x === nx && it.y === ny);
  if (item) {
    if (item.sym === '§') {
      const missing = player.maxHp - player.hp;
      const overflow = item.heal - missing;
      if (overflow > 0) {
        player.maxHp += overflow;
        player.hp = player.maxHp;
        messages.push(t('game.overheal', overflow, player.maxHp));
      } else {
        player.hp += item.heal;
        messages.push(t('game.heal', item.heal));
      }
    } else if (item.sym === '^') {
      player.atk += item.atk;
      messages.push(t('game.atk.buff', item.atk, player.atk));
    }
    items = items.filter(it => it !== item);
  }

  enemyTurn();
  render();
}

function enemyTurn() {
  enemies.forEach(e => {
    const dx = player.x - e.x, dy = player.y - e.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (dist > 10) return;

    if (dist === 1) {
      const dmg = e.atk + rnd(3);
      player.hp = Math.max(0, player.hp - dmg);
      messages.push(t('game.enemy.attack', dmg));
      if (player.hp <= 0) {
        messages.push(t('game.dead'));
        gameOver = true;
      }
      return;
    }

    const steps = [
      [Math.sign(dx), 0],
      [0, Math.sign(dy)],
      [Math.sign(dx), Math.sign(dy)],
    ];
    for (const [mx, my] of steps) {
      if (!mx && !my) continue;
      const ex = e.x + mx, ey = e.y + my;
      if (map[ey]?.[ex] !== '.' && map[ey]?.[ex] !== '≡') continue;
      if (enemies.some(o => o !== e && o.x === ex && o.y === ey)) continue;
      if (ex === player.x && ey === player.y) continue;
      e.x = ex; e.y = ey;
      break;
    }
  });
}

function onThemeChange() { render(); }
function onLangChange() { init(); }

document.addEventListener('keydown', ev => {
  if (ev.key === 'r' || ev.key === 'R') { init(); return; }
  const dirs = {
    ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0],
    w: [0,-1], s: [0,1], a: [-1,0], d: [1,0],
    W: [0,-1], S: [0,1], A: [-1,0], D: [1,0],
  };
  const mv = dirs[ev.key];
  if (mv) { ev.preventDefault(); tryMove(...mv); }
});

init();
