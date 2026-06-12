const SERVERS = [
  { id: 'rpi',     name: 'Raspberry Pi',  cost: 10,     ops: 0.1,  icon: '▪' },
  { id: 'desktop', name: 'Old Desktop',   cost: 80,     ops: 0.5,  icon: '▣' },
  { id: 'laptop',  name: 'Office Laptop', cost: 400,    ops: 2,    icon: '▬' },
  { id: 'gaming',  name: 'Gaming PC',     cost: 1500,   ops: 8,    icon: '◈' },
  { id: 'tower',   name: 'Tower Server',  cost: 6000,   ops: 30,   icon: '▦' },
  { id: 'rack',    name: 'Rack Server',   cost: 25000,  ops: 120,  icon: '▤' },
  { id: 'blade',   name: 'Blade Server',  cost: 100000, ops: 500,  icon: '▥' },
  { id: 'dc',      name: 'Data Center',   cost: 500000, ops: 2500, icon: '▩' },
];

// repeatable = can be bought multiple times, cost scales by costMult each time
const UPGRADES = [
  { id: 'overclock', name: 'Overclock CPU',  cost: 200,     costMult: 3, desc: '2× click power',  repeatable: true,  apply: s => { s.clickMult *= 2; } },
  { id: 'ecc',       name: 'ECC RAM',        cost: 800,     costMult: 3, desc: '1.5× ops/s',      repeatable: true,  apply: s => { s.opsMult *= 1.5; } },
  { id: 'cooling',   name: 'Liquid Cooling', cost: 3000,    costMult: 4, desc: '2× ops/s',        repeatable: true,  apply: s => { s.opsMult *= 2; } },
  { id: 'nvme',      name: 'NVMe Storage',   cost: 8000,    costMult: 3, desc: '3× click power',  repeatable: true,  apply: s => { s.clickMult *= 3; } },
  { id: 'network',   name: '10G Network',    cost: 20000,   costMult: 1, desc: 'Auto-sell ops/s', repeatable: false, apply: s => { s.autoSell = true; } },
  { id: 'fiber',     name: 'Fiber Uplink',   cost: 75000,   costMult: 5, desc: '5× sell value',   repeatable: true,  apply: s => { s.sellMult *= 5; } },
  { id: 'raid',      name: 'RAID Array',     cost: 200000,  costMult: 4, desc: '4× ops/s',        repeatable: true,  apply: s => { s.opsMult *= 4; } },
  { id: 'ai',        name: 'AI Scheduler',   cost: 1000000, costMult: 5, desc: '10× everything',  repeatable: true,  apply: s => { s.opsMult *= 10; s.clickMult *= 10; } },
];

const SAVE_KEY = 'serverfarm-save';
let state = {};
let tickCount = 0;

function freshState() {
  return {
    credits: 0,
    ops: 0,
    opsCap: 100,
    clickMult: 1,
    opsMult: 1,
    sellMult: 1,
    autoSell: false,
    servers: Object.fromEntries(SERVERS.map(s => [s.id, 0])),
    upgrades: {},   // { id: purchaseCount }
    log: ['Server farm online. Click PROCESS to generate ops.'],
    totalEarned: 0,
  };
}

function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() })); } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s.credits !== 'number') return null;
    // migrate old array format
    if (Array.isArray(s.upgrades)) {
      const obj = {};
      s.upgrades.forEach(id => { obj[id] = 1; });
      s.upgrades = obj;
    }
    if (!s.upgrades || typeof s.upgrades !== 'object') s.upgrades = {};
    return s;
  } catch(e) { return null; }
}

function reapplyUpgrades() {
  state.clickMult = 1;
  state.opsMult = 1;
  state.sellMult = 1;
  state.autoSell = false;
  Object.entries(state.upgrades).forEach(([id, count]) => {
    const u = UPGRADES.find(u => u.id === id);
    if (u) for (let i = 0; i < count; i++) u.apply(state);
  });
}

function applyOfflineGains(saved) {
  if (!saved.savedAt) return;
  const elapsed = (Date.now() - saved.savedAt) / 1000; // seconds
  if (elapsed < 5) return;

  // cap at 8 hours so it doesn't get absurd
  const secs = Math.min(elapsed, 8 * 3600);
  let ops = 0;
  SERVERS.forEach(s => { ops += s.ops * (saved.servers[s.id] || 0); });
  ops *= state.opsMult || 1;

  const gained = ops * secs;
  if (gained < 1) return;

  if (saved.autoSell) {
    const earned = Math.floor(gained) * (saved.sellMult || 1);
    state.credits += earned;
    state.totalEarned += earned;
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    state.log.unshift(`Offline (${timeStr}): auto-sold ${fmt(gained)} ops → +${fmt(earned)} credits`);
  } else {
    state.ops = Math.min(state.opsCap, state.ops + gained);
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    state.log.unshift(`Offline (${timeStr}): +${fmt(gained)} ops accumulated`);
  }
  if (state.log.length > 6) state.log.length = 6;
}

function initState() {
  const saved = loadState();
  state = saved || freshState();
  if (saved) {
    reapplyUpgrades();
    applyOfflineGains(saved);
  }
}

function upgradeLevel(u) { return state.upgrades[u.id] || 0; }
function upgradeCost(u)  { return Math.floor(u.cost * Math.pow(u.costMult, upgradeLevel(u))); }

const COST_SCALE = 1.15;

function serverCost(s, owned) {
  return Math.floor(s.cost * Math.pow(COST_SCALE, owned));
}

function serverCostN(s, count) {
  const owned = state.servers[s.id] || 0;
  let total = 0;
  for (let i = 0; i < count; i++) total += serverCost(s, owned + i);
  return total;
}

function maxAffordable(s) {
  const owned = state.servers[s.id] || 0;
  let total = 0, n = 0;
  while (total + serverCost(s, owned + n) <= state.credits) {
    total += serverCost(s, owned + n);
    n++;
  }
  return n;
}

function opsPerSec() {
  let total = 0;
  SERVERS.forEach(s => { total += s.ops * (state.servers[s.id] || 0); });
  return total * state.opsMult;
}

function clickPower() {
  return Math.max(1, Math.floor(opsPerSec() * 0.1 + 1)) * state.clickMult;
}

function fmt(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function addLog(msg) {
  state.log.push(msg);
  if (state.log.length > 6) state.log.shift();
}

function processClick() {
  state.ops = Math.min(state.opsCap, state.ops + clickPower());
  renderStats();
}

function sellOps() {
  if (state.ops < 1) return;
  const earned = Math.floor(state.ops) * state.sellMult;
  state.credits += earned;
  state.totalEarned += earned;
  addLog(`Sold ${fmt(state.ops)} ops → +${fmt(earned)} credits`);
  state.ops = 0;
  renderStats();
  renderShop();
  saveState();
}

function buyServer(id, amount) {
  const s = SERVERS.find(s => s.id === id);
  if (!s) return;
  const count = amount === 'max' ? maxAffordable(s) : amount;
  if (count <= 0) return;
  const total = serverCostN(s, count);
  if (state.credits < total) return;
  state.credits -= total;
  state.servers[id] += count;
  state.opsCap = Math.max(state.opsCap, opsPerSec() * 30 + 200);
  addLog(`Bought ${count}× ${s.name}`);
  renderStats();
  renderShop();
  saveState();
}

function buyUpgrade(id) {
  const u = UPGRADES.find(u => u.id === id);
  if (!u) return;
  const level = upgradeLevel(u);
  if (!u.repeatable && level >= 1) return;
  const cost = upgradeCost(u);
  if (state.credits < cost) return;
  state.credits -= cost;
  state.upgrades[id] = level + 1;
  u.apply(state);
  const lvlStr = u.repeatable ? ` Lv.${state.upgrades[id]}` : '';
  addLog(`Upgrade: ${u.name}${lvlStr} — ${u.desc}`);
  renderStats();
  renderShop();
  saveState();
}

function resetProgress() {
  if (!confirm('Fortschritt wirklich zurücksetzen?')) return;
  localStorage.removeItem(SAVE_KEY);
  state = freshState();
  tickCount = 0;
  renderStats();
  renderShop();
}

function tick() {
  state.ops = Math.min(state.opsCap, state.ops + opsPerSec() / 20);
  if (state.autoSell && state.ops >= state.opsCap * 0.9) {
    const earned = Math.floor(state.ops) * state.sellMult;
    state.credits += earned;
    state.totalEarned += earned;
    state.ops = 0;
  }
  tickCount++;
  renderStats();
  if (tickCount % 10 === 0) { renderShop(); saveState(); }
}

function serverBuyBtns(s) {
  const btn = (n, label) => {
    const can = state.credits >= serverCostN(s, n);
    return `<button class="shop-btn ${can ? '' : 'disabled'}" onmousedown="event.preventDefault()" onclick="buyServer('${s.id}',${n})">${label}</button>`;
  };
  const canMax = maxAffordable(s) > 0;
  return `${btn(1,'×1')}${btn(10,'×10')}${btn(100,'×100')}<button class="shop-btn ${canMax ? '' : 'disabled'}" onmousedown="event.preventDefault()" onclick="buyServer('${s.id}','max')">max</button>`;
}

function renderStats() {
  document.getElementById('credits').textContent = fmt(state.credits);
  document.getElementById('ops').textContent = `${fmt(state.ops)} / ${fmt(state.opsCap)}`;
  document.getElementById('ops-s').textContent = fmt(opsPerSec()) + '/s';
  document.getElementById('click-power').textContent = fmt(clickPower());
  document.getElementById('total-earned').textContent = fmt(state.totalEarned);
  document.getElementById('ops-bar-fill').style.width = Math.min(100, (state.ops / state.opsCap) * 100) + '%';
  document.getElementById('log').textContent = state.log.slice().reverse().join('\n');
}

function renderShop() {
  document.getElementById('server-list').innerHTML = SERVERS.map(s => {
    const count = state.servers[s.id] || 0;
    const canBuy = state.credits >= serverCost(s, count);
    return `<div class="shop-item ${canBuy ? 'can-afford' : ''}" style="flex-direction:column;align-items:stretch;gap:4px;">
      <div class="shop-item-info">
        <span class="shop-icon">${s.icon}</span>
        <span class="shop-name">${s.name}</span>
        <span class="shop-count">${count > 0 ? `×${count}` : ''}</span>
        ${count > 0 ? `<span class="shop-contrib">${fmt(s.ops * count * state.opsMult)}/s</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:4px;">
        <span class="shop-cost" style="margin-right:2px;">${fmt(serverCost(s, state.servers[s.id] || 0))}c</span>
        ${serverBuyBtns(s)}
      </div>
    </div>`;
  }).join('');

  document.getElementById('upgrade-list').innerHTML = UPGRADES.map(u => {
    const level = upgradeLevel(u);
    const done = !u.repeatable && level >= 1;
    if (done) return `<div class="shop-item bought">
      <span class="shop-icon">✓</span>
      <span class="shop-name">${u.name}</span>
      <span class="shop-contrib">${u.desc}</span>
    </div>`;
    const cost = upgradeCost(u);
    const canBuy = state.credits >= cost;
    const lvlTag = u.repeatable && level > 0 ? ` <span class="shop-count">Lv.${level}</span>` : '';
    return `<div class="shop-item ${canBuy ? 'can-afford' : ''}">
      <div class="shop-item-info">
        <span class="shop-name">${u.name}${lvlTag}</span>
        <span class="shop-contrib">${u.desc}</span>
      </div>
      <div class="shop-item-right">
        <span class="shop-cost">${fmt(cost)}c</span>
        <button class="shop-btn ${canBuy ? '' : 'disabled'}" onmousedown="event.preventDefault()" onclick="buyUpgrade('${u.id}')">Buy</button>
      </div>
    </div>`;
  }).join('');

  const owned = SERVERS.filter(s => state.servers[s.id] > 0);
  document.getElementById('farm-grid').innerHTML = owned.length === 0
    ? `<div class="farm-row"><span class="farm-row-icon">·</span><span class="farm-row-name" style="color:var(--color-dim)">Empty — buy your first server</span></div>`
    : owned.map(s => `<div class="farm-row active">
        <span class="farm-row-icon">${s.icon}</span>
        <span class="farm-row-name">${s.name}</span>
        <span class="farm-row-count">×${state.servers[s.id]}</span>
        <span class="farm-row-ops">${fmt(s.ops * state.servers[s.id] * state.opsMult)}/s</span>
      </div>`).join('');
}

function onThemeChange() { renderShop(); }

document.addEventListener('keydown', ev => {
  if (ev.code === 'Space' && !ev.repeat) { ev.preventDefault(); processClick(); }
});

initState();
renderStats();
renderShop();
setInterval(tick, 50);
