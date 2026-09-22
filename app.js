/**
 * GeoSpatial Core LMS - 3D Engine & Interactive Micro-Tasks
 * Pure Mathematical 3D Projections (Vertices, Mesh, Heightmaps, Spheres)
 */

const STORAGE_KEY = 'geospatial_games_v2';

const LMS = {
  getStore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  },
  setDone(gameId) {
    const data = this.getStore();
    data[gameId] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this.refreshBadges();
  },
  refreshBadges() {
    const data = this.getStore();
    const totalGames = 15;
    const doneKeys = Object.keys(data).filter(k => data[k]);
    const count = doneKeys.length;
    const percent = Math.round((count / totalGames) * 100);

    const fill = document.getElementById('global-fill');
    const label = document.getElementById('global-label');
    if (fill) fill.style.width = `${percent}%`;
    if (label) label.innerText = `${count} / ${totalGames} (${percent}%)`;

    document.querySelectorAll('[data-game-badge]').forEach(el => {
      const gid = el.getAttribute('data-game-badge');
      if (data[gid]) {
        el.classList.add('done');
        el.innerText = 'ГОТОВО';
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  LMS.refreshBadges();
  initAllGames();
});

function initAllGames() {
  // § 5-6
  initGamePinch();
  initGameTinder();
  initGame3DTerrainDial();

  // § 7-8
  initGame3DGlobeOrbit();
  initGameBeacons();
  initGame3DErdasSpectrum();

  // § 9-10
  initGame3DLayerStack();
  initGameLasso();
  initGameConveyor();

  // § 11
  initGameScratch();
  initGameRadar();
  initGameLogistic();

  // § 12
  initGameShredder();
  initGameEqualizer();
  initGameNetHub();
}

/* ==========================================================================
   § 5—6. ИГРЫ (3D РЕЛЬЕФ)
   ========================================================================== */

function initGamePinch() {
  const slider = document.getElementById('pinch-slider');
  if (!slider) return;
  const rasterBox = document.getElementById('raster-box');
  const vectorBox = document.getElementById('vector-box');
  const vectorWarn = document.getElementById('vector-warn');

  let rasterValid = false;
  let vectorValid = false;
  let selectedToken = null;

  slider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    rasterBox.style.transform = `scale(${val})`;
    rasterBox.style.imageRendering = val > 1.3 ? 'pixelated' : 'auto';
    vectorBox.style.transform = `scale(${val})`;
    if (val >= 1.8 && !vectorValid) {
      vectorWarn.style.display = 'block';
    }
  });

  window.selectPinchToken = (type, el) => {
    document.querySelectorAll('.token-chip-pinch').forEach(c => c.classList.remove('selected'));
    if (selectedToken === type) {
      selectedToken = null;
    } else {
      selectedToken = type;
      el.classList.add('selected');
    }
  };

  window.handlePinchSlotClick = (target) => {
    if (selectedToken) executePinch(selectedToken, target);
  };

  window.allowDrop = (ev) => ev.preventDefault();
  window.dragToken = (ev, type) => {
    ev.dataTransfer.setData('text/plain', type);
    selectedToken = type;
  };
  window.dropToken = (ev, target) => {
    ev.preventDefault();
    const type = ev.dataTransfer.getData('text/plain') || selectedToken;
    if (type) executePinch(type, target);
  };

  function executePinch(type, target) {
    const fb = document.getElementById('p56-g1-fb');
    if (target === 'raster' && type === 'pixel-matrix') {
      rasterValid = true;
      document.getElementById('slot-raster-txt').innerText = '✓ [Матрица пикселей] привязана';
      document.getElementById('slot-raster-txt').style.color = '#10b981';
      document.getElementById('chip-pixel').classList.add('disabled');
      selectedToken = null;
    } else if (target === 'vector' && type === 'attr-db') {
      vectorValid = true;
      vectorWarn.style.display = 'none';
      document.getElementById('slot-vector-txt').innerText = '✓ [База данных атрибутов] связана';
      document.getElementById('slot-vector-txt').style.color = '#10b981';
      document.getElementById('chip-attr').classList.add('disabled');
      selectedToken = null;
    } else {
      fb.className = 'status-callout err show';
      fb.innerText = 'Неверное сопоставление маркера и типа отображения карты!';
      setTimeout(() => fb.classList.remove('show'), 1500);
      return;
    }

    if (rasterValid && vectorValid) {
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Валидация пройдена!</strong> Растровый способ определен как матрица пикселей, векторный связан с базой атрибутов.';
      LMS.setDone('p56_g1');
    }
  }
}

function initGameTinder() {
  const card = document.getElementById('tinder-card');
  if (!card) return;

  const deck = [
    { text: 'Геодезические характеристики и рельеф местности', target: 'UP' },
    { text: 'Пастбища, болота, водопроводы, скважины', target: 'RIGHT' },
    { text: 'Данные о породах деревьев и лесах, технические параметры', target: 'DOWN' },
    { text: 'Географическая номенклатура и наименование местности', target: 'LEFT' }
  ];

  let currentIdx = 0, combo = 0;
  let startX = 0, startY = 0, currentX = 0, currentY = 0, isDragging = false;

  function loadCard() {
    if (currentIdx >= deck.length) {
      card.style.display = 'none';
      const fb = document.getElementById('p56-g2-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = `<strong>Win State: Комбо ${combo}/4!</strong> Все 4 пакета информации распределены без сбоев.`;
      LMS.setDone('p56_g2');
      return;
    }
    card.innerText = deck[currentIdx].text;
    card.style.transform = 'translate(0px, 0px) rotate(0deg)';
    document.getElementById('tinder-combo-counter').innerText = `Комбо: ${combo}/4`;
  }
  loadCard();

  function triggerSwipe(dir) {
    if (currentIdx >= deck.length) return;
    const item = deck[currentIdx];
    const fb = document.getElementById('p56-g2-fb');

    if (item.target === dir) {
      combo++;
      currentIdx++;
      loadCard();
    } else {
      combo = 0;
      fb.className = 'status-callout err show';
      fb.innerText = 'Сбой! Категория неверна, счетчик комбо сброшен.';
      setTimeout(() => fb.classList.remove('show'), 1200);
      currentIdx = 0;
      loadCard();
    }
  }
  window.manualSwipe = triggerSwipe;

  card.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    card.setPointerCapture(e.pointerId);
  });
  card.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentX * 0.08}deg)`;
  });
  card.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    const threshold = 60;
    if (Math.abs(currentX) > Math.abs(currentY)) {
      if (currentX > threshold) triggerSwipe('RIGHT');
      else if (currentX < -threshold) triggerSwipe('LEFT');
      else card.style.transform = 'translate(0px, 0px)';
    } else {
      if (currentY < -threshold) triggerSwipe('UP');
      else if (currentY > threshold) triggerSwipe('DOWN');
      else card.style.transform = 'translate(0px, 0px)';
    }
    currentX = 0; currentY = 0;
  });
}

// Мини-игра 3: ЧЕСТНЫЙ 3D-РЕЛЬЕФ (3D Mesh Projection + Rotary Dial)
function initGame3DTerrainDial() {
  const dial = document.getElementById('rotary-dial');
  const canvas = document.getElementById('terrain-canvas');
  if (!dial || !canvas) return;
  const ctx = canvas.getContext('2d');

  let mode = 'Постенная'; // Постенная | Непрерывная | Структурная
  let angleX = 0.6;
  let angleY = -0.5;
  let isLocked = false;

  // Генерация трехмерной сетки высот Z = f(X, Y)
  const gridSize = 14;
  const grid = [];
  for (let x = 0; x <= gridSize; x++) {
    grid[x] = [];
    for (let y = 0; y <= gridSize; y++) {
      const nx = (x / gridSize - 0.5) * 4;
      const ny = (y / gridSize - 0.5) * 4;
      // Функция холма с пиками
      const z = Math.exp(-(nx * nx + ny * ny)) * 1.8 + Math.sin(nx * 2) * 0.2;
      grid[x][y] = z;
    }
  }

  // 3D Математическая проекция (Rotation + Perspective)
  function project3D(x, y, z, cx, cy, scale) {
    // Вращение по Y
    let x1 = x * Math.cos(angleY) + z * Math.sin(angleY);
    let z1 = -x * Math.sin(angleY) + z * Math.cos(angleY);
    // Вращение по X
    let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
    let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

    const fov = 300;
    const distance = 4;
    const pScale = fov / (distance + z2);

    return {
      px: cx + x1 * pScale * scale,
      py: cy + y2 * pScale * scale,
      depth: z2
    };
  }

  function render3DScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 10;
    const scale = 38;

    // Вращение рельефа мышью внутри канваса
    angleY += 0.003; // фоновое медленное 3D-вращение

    if (mode === 'Постенная') {
      // Отрисовка базовой 3D-плоскости с качественными 3D-метками на вершинах
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;

      // Контур основания
      const p1 = project3D(-1.5, 0, -1.5, cx, cy, scale);
      const p2 = project3D(1.5, 0, -1.5, cx, cy, scale);
      const p3 = project3D(1.5, 0, 1.5, cx, cy, scale);
      const p4 = project3D(-1.5, 0, 1.5, cx, cy, scale);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py);
      ctx.lineTo(p3.px, p3.py); ctx.lineTo(p4.px, p4.py);
      ctx.closePath();
      ctx.stroke();

      // 3D-маркеры на вершине холма
      const peak = project3D(0, -1.8, 0, cx, cy, scale);
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(peak.px, peak.py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '11px Inter';
      ctx.fillText('▲ Залежь / Лес (Качественный знак)', peak.px + 10, peak.py);

    } else if (mode === 'Непрерывная') {
      // Отрисовка плотной трехмерной полигональной сетки (Mesh)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 0.8;
      ctx.fillStyle = '#0369a1';

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const xPos = (x / gridSize - 0.5) * 3;
          const yPos = (y / gridSize - 0.5) * 3;
          const zPos = -grid[x][y];

          const p = project3D(xPos, zPos, yPos, cx, cy, scale);
          ctx.fillRect(p.px - 1.5, p.py - 1.5, 3, 3);

          if (x < gridSize - 1) {
            const pNextX = project3D(((x + 1) / gridSize - 0.5) * 3, -grid[x + 1][y], yPos, cx, cy, scale);
            ctx.beginPath();
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(pNextX.px, pNextX.py);
            ctx.stroke();
          }
          if (y < gridSize - 1) {
            const pNextY = project3D(xPos, -grid[x][y + 1], ((y + 1) / gridSize - 0.5) * 3, cx, cy, scale);
            ctx.beginPath();
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(pNextY.px, pNextY.py);
            ctx.stroke();
          }
        }
      }

    } else if (mode === 'Структурная') {
      // 3D-структурные изолинии среднего уровня рельефа
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#065f46';

      // Отрисовка каркаса холма
      for (let r = 0.4; r <= 1.4; r += 0.5) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.2) {
          const hX = Math.cos(a) * r;
          const hY = Math.sin(a) * r;
          const hZ = -Math.exp(-(hX * hX + hY * hY)) * 1.8;
          const p = project3D(hX, hZ, hY, cx, cy, scale);
          if (a === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      const meanP = project3D(0, -1.0, 0, cx, cy, scale);
      ctx.font = '11px Inter';
      ctx.fillText('● 3D-линия среднего уровня высот (Структурная)', meanP.px - 90, meanP.py - 10);
    }

    requestAnimationFrame(render3DScene);
  }
  requestAnimationFrame(render3DScene);

  // Вращение диска
  const positions = [
    { label: 'Постенная', desc: 'Отображение качественных/количественных знаков' },
    { label: 'Непрерывная', desc: 'Плотная 3D-сетка точек рельефа с учетом частоты' },
    { label: 'Структурная', desc: 'Точки строго определяют средний уровень высоты местности' }
  ];
  let curPos = 0;

  dial.addEventListener('click', () => {
    if (isLocked) return;
    curPos = (curPos + 1) % positions.length;
    const target = positions[curPos];
    mode = target.label;
    dial.style.transform = `rotate(${curPos * 120}deg)`;
    document.getElementById('dial-mode-name').innerText = `3D-режим: ${target.label}`;
    document.getElementById('dial-mode-desc').innerText = target.desc;

    if (target.label === 'Структурная') {
      isLocked = true;
      document.getElementById('dial-lock-icon').innerText = '🔒 Зафиксировано';
      const fb = document.getElementById('p56-g3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Диск зафиксирован замком!</strong> 3D-точки рельефа выстроены по линиям среднего уровня высот местности.';
      LMS.setDone('p56_g3');
    }
  });
}

/* ==========================================================================
   § 7—8. МЕТОДЫ ДЗЗ (3D ГЛОБУС & 3D ERDAS)
   ========================================================================== */

// Игра 1: ВРАЩАЮЩИЙСЯ 3D-ГЛОБУС С ОРБИТОЙ KazEOSat-1
function initGame3DGlobeOrbit() {
  const canvas = document.getElementById('orbit-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let globeRotY = 0;
  let revCount = 0;
  let isTracing = false;

  function render3DGlobe() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = 75;

    globeRotY += 0.008; // авто-вращение 3D-Земли

    // 3D Тело сферы (Земля)
    const grad = ctx.createRadialGradient(cx - 25, cy - 25, 10, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.7, '#e2e8f0');
    grad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 3D-Меридианы и параллели
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let lat = -60; lat <= 60; lat += 30) {
      const latRad = lat * (Math.PI / 180);
      const y = cy + Math.sin(latRad) * r * 0.9;
      const rx = Math.cos(latRad) * r;
      ctx.beginPath();
      ctx.ellipse(cx, y, rx, rx * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let lon = 0; lon < Math.PI * 2; lon += Math.PI / 4) {
      const curLon = lon + globeRotY;
      const xOffset = Math.sin(curLon) * r;
      if (Math.cos(curLon) > 0) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(xOffset), r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 3D Полярный коридор (Таймыр -> Индия)
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, -Math.PI / 2, Math.PI / 3);
    ctx.stroke();

    ctx.fillStyle = '#4f46e5';
    ctx.font = '11px Inter';
    ctx.fillText('п-ов Таймыр (Север)', cx - 60, cy - 85);
    ctx.fillText('Север Индии', cx + 30, cy + 70);

    // Спутник KazEOSat-1 на 3D-орбите
    const satAngle = (revCount * 0.4) % (Math.PI * 2) - Math.PI / 2;
    const satX = cx + Math.cos(satAngle) * (r + 14);
    const satY = cy + Math.sin(satAngle) * (r + 14);

    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.rect(satX - 5, satY - 5, 10, 10);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(satX - 5, satY - 5, 10, 10);

    requestAnimationFrame(render3DGlobe);
  }
  requestAnimationFrame(render3DGlobe);

  canvas.addEventListener('pointerdown', () => { isTracing = true; });
  window.addEventListener('pointerup', () => { isTracing = false; });

  canvas.addEventListener('pointermove', () => {
    if (!isTracing) return;
    revCount++;
    const displayRev = Math.min(14, Math.floor(revCount / 7));
    document.getElementById('sat-rev-counter').innerText = `${displayRev} / 14 витков в сутки`;

    if (displayRev === 14) {
      document.getElementById('sat-mode-trigger').style.display = 'inline-flex';
    }
  });

  window.activateKazEOSatMode = () => {
    const fb = document.getElementById('p78-g1-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Win State: Спутник KazEOSat-1 активирован!</strong> 14 оборотов в сутки по полярной орбите. Трансляция в панхроматическом + мультиспектральном режимах запущена.';
    LMS.setDone('p78_g1');
  };
}

function initGameBeacons() {
  const container = document.getElementById('beacons-game');
  if (!container) return;

  const matches = {
    'slot-aore': 'AORE',
    'slot-ior': 'IOR',
    'slot-waas': 'WAAS',
    'slot-msas': 'MSAS'
  };
  let plugged = 0;
  let selectedBeacon = null;

  window.selectBeacon = (name, el) => {
    document.querySelectorAll('.token-chip-beacon').forEach(b => b.classList.remove('selected'));
    if (selectedBeacon === name) {
      selectedBeacon = null;
    } else {
      selectedBeacon = name;
      el.classList.add('selected');
    }
  };

  window.handleBeaconSlotClick = (slotId) => {
    if (selectedBeacon) executeBeacon(selectedBeacon, slotId);
  };

  window.dragBeacon = (ev, name) => {
    ev.dataTransfer.setData('text/plain', name);
    selectedBeacon = name;
  };
  window.dropBeacon = (ev, slotId) => {
    ev.preventDefault();
    const b = ev.dataTransfer.getData('text/plain') || selectedBeacon;
    if (b) executeBeacon(b, slotId);
  };

  function executeBeacon(beacon, slotId) {
    if (matches[slotId] === beacon) {
      const el = document.getElementById(slotId);
      if (el.classList.contains('filled')) return;

      el.classList.add('filled');
      el.innerText = `✓ [${beacon}] Примагничен к океаническому слоту`;
      document.getElementById(`chip-${beacon}`).classList.add('disabled');
      selectedBeacon = null;
      plugged++;

      if (plugged === 4) {
        document.getElementById('beacons-wave-indicator').style.display = 'block';
        const fb = document.getElementById('p78-g2-fb');
        fb.className = 'status-callout ok show';
        fb.innerHTML = '<strong>Win State: Все 4 маяка испустили синхронную навигационную волну!</strong> Точность GPS на геопортале достигла 1 метра.';
        LMS.setDone('p78_g2');
      }
    } else {
      const fb = document.getElementById('p78-g2-fb');
      fb.className = 'status-callout err show';
      fb.innerText = `Маяк [${beacon}] не подходит для этой океанической зоны!`;
      setTimeout(() => fb.classList.remove('show'), 1400);
    }
  }
}

// Игра 3: ДЕТАЛИЗИРОВАННАЯ 3D-МОДЕЛЬ ERDAS IMAGING
function initGame3DErdasSpectrum() {
  const slider = document.getElementById('spectrum-range');
  const canvas = document.getElementById('erdas-3d-canvas');
  if (!slider || !canvas) return;
  const ctx = canvas.getContext('2d');

  let channels = 1;
  let rot = 0;

  function render3DErdas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    rot += 0.01;

    if (channels < 20) {
      // Плоский 2D спектр
      ctx.fillStyle = channels >= 5 ? '#fef3c7' : '#f1f5f9';
      ctx.fillRect(cx - 90, cy - 30, 180, 60);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(cx - 90, cy - 30, 180, 60);
      ctx.fillStyle = '#475569';
      ctx.font = '12px Inter';
      ctx.fillText(channels >= 5 ? 'Многоканальное сканирование' : 'Оптический 2D-снимок', cx - 75, cy + 5);
    } else {
      // Настоящая 3D-модель изменений среды (3D DEM Mesh Extrusion)
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 1;

      const size = 8;
      for (let x = -size; x <= size; x++) {
        for (let y = -size; y <= size; y++) {
          const z = Math.sin(Math.hypot(x, y) - rot * 2) * 15;
          const px = cx + (x * Math.cos(0.5) - y * Math.sin(0.5)) * 12;
          const py = cy + (x * Math.sin(0.5) + y * Math.cos(0.5)) * 6 - z;

          ctx.fillStyle = `hsl(${220 + z * 3}, 80%, 60%)`;
          ctx.fillRect(px, py, 4, 4);
        }
      }
      ctx.fillStyle = '#4338ca';
      ctx.font = '11px Inter';
      ctx.fillText('ERDAS: Гиперспектральная 3D-модель динамики среды', cx - 140, 20);
    }

    requestAnimationFrame(render3DErdas);
  }
  requestAnimationFrame(render3DErdas);

  slider.addEventListener('input', (e) => {
    channels = parseInt(e.target.value);
    document.getElementById('spectrum-val').innerText = `${channels} каналов`;
    const badge = document.getElementById('spectrum-type-badge');

    if (channels < 5) {
      badge.innerText = 'Оптический';
      badge.style.background = '#e2e8f0';
    } else if (channels < 20) {
      badge.innerText = 'Многоканальное (5—19)';
      badge.style.background = '#fef3c7';
    } else {
      badge.innerText = 'ГИПЕРСПЕКТРАЛЬНОЕ (20+ КАНАЛОВ)';
      badge.style.background = '#e0e7ff';
      badge.style.color = '#4338ca';

      const fb = document.getElementById('p78-g3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: ERDAS Imaging зафиксировал гиперспектральный захват!</strong> Преодолен порог в 20 диапазонов, сгенерирована 3D-модель изменений среды.';
      LMS.setDone('p78_g3');
    }
  });
}

/* ==========================================================================
   § 9—10. ОСОБЕННОСТИ ГИС (ИЗОМЕТРИЧЕСКИЙ 3D-ПИРОГ)
   ========================================================================== */

// Игра 1: СБОРКА СЛОЕНОГО ГИС-ПИРОГА В 3D ПРОСТРАНСТВЕ (CSS 3D Z-STACK)
function initGame3DLayerStack() {
  const stage = document.getElementById('stage-3d');
  if (!stage) return;

  const stack = [];
  const names = {
    'base': 'Опорный слой (Геоположение)',
    'hydro': 'Гидрография',
    'transport': 'Транспортная сеть',
    'vegetation': 'Растительность'
  };
  let selectedLayer = null;

  window.selectStackLayer = (id, el) => {
    document.querySelectorAll('.token-chip-layer').forEach(c => c.classList.remove('selected'));
    if (selectedLayer === id) {
      selectedLayer = null;
    } else {
      selectedLayer = id;
      el.classList.add('selected');
    }
  };

  window.handle3DStageClick = () => {
    if (selectedLayer) execute3DStack(selectedLayer);
  };

  window.dragLayer = (ev, id) => {
    ev.dataTransfer.setData('text/plain', id);
    selectedLayer = id;
  };
  window.dropLayer = (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData('text/plain') || selectedLayer;
    if (id) execute3DStack(id);
  };

  function execute3DStack(id) {
    const fb = document.getElementById('p910-g1-fb');

    if (stack.length === 0 && id !== 'base') {
      fb.className = 'status-callout err show';
      fb.innerText = 'Слой упал с площадки! Основанием 3D-пирога может служить ТОЛЬКО [Опорный слой (Геоположение)].';
      // Тряска 3D-сцены при ошибке
      stage.style.transform = 'rotateX(55deg) rotateZ(-35deg) translateZ(-20px)';
      setTimeout(() => { stage.style.transform = 'rotateX(55deg) rotateZ(-35deg)'; }, 300);
      return;
    }

    if (!stack.includes(id)) {
      stack.push(id);
      const zOffset = (stack.length - 1) * 45; // физический подъем по оси Z в 3D
      const plane = document.getElementById(`plane-3d-${stack.length}`);

      plane.classList.add('filled');
      if (id === 'base') plane.classList.add('locked-base');
      plane.style.setProperty('--z-offset', `${zOffset}px`);
      plane.innerHTML = `<span>${id === 'base' ? '🔒' : '📄'} Слой ${stack.length}: ${names[id]}</span>`;

      document.getElementById(`chip-${id}`).classList.add('disabled');
      selectedLayer = null;
      fb.classList.remove('show');
    }

    if (stack.length === 4) {
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Стопка слоев объединена в 3D-модель!</strong> Опорный слой защелкнут замком в основании платформы, тематические слои распределены по оси Z.';
      LMS.setDone('p910_g1');
    }
  }
}

function initGameLasso() {
  const canvas = document.getElementById('lasso-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let points = [];
  let bufferReady = false;

  function renderPipeline() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(30, 110);
    ctx.lineTo(370, 110);
    ctx.stroke();

    ctx.fillStyle = '#0369a1';
    ctx.font = '11px Inter';
    ctx.fillText('Магистральный газопровод', 90, 95);
  }
  renderPipeline();

  canvas.addEventListener('pointerdown', () => { isDrawing = true; points = []; });
  window.addEventListener('pointerup', () => {
    isDrawing = false;
    if (points.length > 12) {
      bufferReady = true;
      document.getElementById('sql-action-panel').style.display = 'block';
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    points.push({ x, y });

    ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
    ctx.lineWidth = 16;
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  window.executeMapInfoSql = () => {
    if (!bufferReady) return;
    const fb = document.getElementById('p910-g2-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Win State: Расчет MapInfo Professional завершен!</strong> Таблицы объединены через SQL, определена площадь буферной зоны и периметр.';
    LMS.setDone('p910_g2');
  };
}

function initGameConveyor() {
  const board = document.getElementById('conveyor-board');
  if (!board) return;

  const valid = { 'slot-ai': 'ai', 'slot-mapinfo': 'mapinfo', 'slot-corel': 'corel' };
  const names = { 'ai': 'Adobe Illustrator', 'mapinfo': 'MapInfo Professional', 'corel': 'Corel Photo-Paint' };
  let placed = 0;
  let selectedSoft = null;

  window.selectSoft = (id, el) => {
    document.querySelectorAll('.token-chip-soft').forEach(c => c.classList.remove('selected'));
    if (selectedSoft === id) selectedSoft = null;
    else { selectedSoft = id; el.classList.add('selected'); }
  };

  window.handleConveyorSlotClick = (slotId) => {
    if (selectedSoft) executeSoft(selectedSoft, slotId);
  };

  window.dragSoft = (ev, id) => {
    ev.dataTransfer.setData('text/plain', id);
    selectedSoft = id;
  };
  window.dropSoftware = (ev, slotId) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData('text/plain') || selectedSoft;
    if (id) executeSoft(id, slotId);
  };

  function executeSoft(id, slotId) {
    if (valid[slotId] === id) {
      const el = document.getElementById(slotId);
      if (el.classList.contains('filled')) return;

      el.classList.add('filled');
      el.innerText = `✓ [${names[id]}] — Готово к экспорту`;
      document.getElementById(`chip-soft-${id}`).classList.add('disabled');
      selectedSoft = null;
      placed++;

      if (placed === 3) {
        const fb = document.getElementById('p910-g3-fb');
        fb.className = 'status-callout ok show';
        fb.innerHTML = '<strong>Win State: Все 3 конвейерные линии активны!</strong> Статус: «Готово к экспорту».';
        LMS.setDone('p910_g3');
      }
    } else {
      const fb = document.getElementById('p910-g3-fb');
      fb.className = 'status-callout err show';
      fb.innerText = 'ПО не подходит для выполнения задачи данного слота!';
      setTimeout(() => fb.classList.remove('show'), 1400);
    }
  }
}

/* ==========================================================================
   § 11. СВЯЗЬ ГИС С ОТРАСЛЯМИ
   ========================================================================== */

function initGameScratch() {
  const canvas = document.getElementById('scratch-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let scratched = 0;
  let isScratching = false;

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1e293b';
  ctx.font = '12px Inter';
  ctx.fillText('Сотрите защитную серую пленку: Неучтенные земли', 35, 75);

  canvas.addEventListener('pointerdown', () => isScratching = true);
  window.addEventListener('pointerup', () => isScratching = false);
  canvas.addEventListener('pointermove', (e) => {
    if (!isScratching) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    scratched++;
    if (scratched > 35) {
      document.getElementById('ms-stamps-panel').style.display = 'flex';
    }
  });

  let stampOwner = false;
  let stampYears = false;

  window.applyMsStamp = (type) => {
    if (type === 'owner') stampOwner = true;
    if (type === 'years') stampYears = true;

    if (stampOwner && stampYears) {
      const fb = document.getElementById('p11-g1-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Земля внесена в реестр проекта «Цифровой Казахстан»!</strong> Установлен собственник и 3 года неиспользования.';
      LMS.setDone('p11_g1');
    }
  };
}

function initGameRadar() {
  const pad = document.getElementById('radar-pad');
  if (!pad) return;

  const targetX = 230;
  const targetY = 85;
  let hotspotFound = false;

  pad.addEventListener('pointermove', (e) => {
    const rect = pad.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dist = Math.hypot(x - targetX, y - targetY);
    const cursor = document.getElementById('radar-reticle');
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    if (dist < 32) {
      pad.style.background = '#fef2f2';
      cursor.style.borderColor = '#ef4444';
      if ('vibrate' in navigator) navigator.vibrate(40);
      document.getElementById('radar-status-tag').innerText = '🔥 Высокоминерализованный очаг грунта!';
      document.getElementById('gps-pin-btn').style.display = 'inline-flex';
      hotspotFound = true;
    } else {
      pad.style.background = '#ffffff';
      cursor.style.borderColor = '#4f46e5';
    }
  });

  window.dropGpsPin = () => {
    if (!hotspotFound) return;
    const fb = document.getElementById('p11-g2-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Win State: Месторождение зафиксировано!</strong> GPS-метка закреплена в координатах базы данных.';
    LMS.setDone('p11_g2');
  };
}

function initGameLogistic() {
  const canvas = document.getElementById('logistic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let isTracing = false;
  let hasFailed = false;

  function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fee2e2';
    ctx.fillRect(80, 20, 110, 110);
    ctx.fillStyle = '#991b1b';
    ctx.font = '10px Inter';
    ctx.fillText('Зона риска ЧС / Горы', 88, 75);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(10, 60, 45, 30);
    ctx.fillStyle = '#fff';
    ctx.fillText('Парк А', 14, 78);

    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(320, 60, 50, 30);
    ctx.fillStyle = '#fff';
    ctx.fillText('Хаб Б', 330, 78);
  }
  renderMap();

  canvas.addEventListener('pointerdown', () => { isTracing = true; hasFailed = false; renderMap(); });
  window.addEventListener('pointerup', () => {
    if (!isTracing) return;
    isTracing = false;
    if (!hasFailed) {
      document.getElementById('cargo-score-bar').style.display = 'block';
      const fb = document.getElementById('p11-g3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Грузооборот: МАКСИМУМ!</strong> Маршрут утвержден в логистической системе.';
      LMS.setDone('p11_g3');
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isTracing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 4;
    ctx.lineTo(x, y);
    ctx.stroke();

    if (x > 80 && x < 190 && y > 20 && y < 130) {
      hasFailed = true;
      const fb = document.getElementById('p11-g3-fb');
      fb.className = 'status-callout err show';
      fb.innerText = 'Трасса пересекла опасную зону кризиса! Проложите путь в обход.';
    }
  });
}

/* ==========================================================================
   § 12. ГЕОГРАФИЧЕСКАЯ БД
   ========================================================================== */

function initGameShredder() {
  const card = document.getElementById('shredder-card');
  if (!card) return;

  const items = [
    { name: 'Геодезический знак', type: 'point' },
    { name: 'Нефтепровод', type: 'line' },
    { name: 'Озеро Зайсан', type: 'polygon' },
    { name: 'Лесной массив', type: 'polygon' },
    { name: 'Граница нацпарка', type: 'line' }
  ];
  let cur = 0;

  function loadItem() {
    if (cur >= items.length) {
      card.style.display = 'none';
      const fb = document.getElementById('p12-g1-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Все 5 объектов классифицированы по ГОСТу!</strong> Точки (0D), линии (1D) и полигоны (2D) разнесены по слоям БД.';
      LMS.setDone('p12_g1');
      return;
    }
    card.innerText = items[cur].name;
  }
  loadItem();

  window.sortShredder = (type) => {
    if (cur >= items.length) return;
    if (items[cur].type === type) {
      cur++;
      loadItem();
    } else {
      const fb = document.getElementById('p12-g1-fb');
      fb.className = 'status-callout err show';
      fb.innerText = 'Неверная геометрия! Сверьтесь с числом измерений объекта.';
      setTimeout(() => fb.classList.remove('show'), 1200);
    }
  };
}

function initGameEqualizer() {
  const f1 = document.getElementById('eq-fader-1');
  const f2 = document.getElementById('eq-fader-2');
  const f3 = document.getElementById('eq-fader-3');
  if (!f1 || !f2 || !f3) return;

  function checkEq() {
    if (parseInt(f1.value) >= 90 && parseInt(f2.value) >= 90 && parseInt(f3.value) >= 90) {
      const fb = document.getElementById('p12-g2-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: База данных валидирована!</strong> Достигнуты ТОЧНОСТЬ, СВОЕВРЕМЕННОСТЬ и ПОЛНОЦЕННОСТЬ.';
      LMS.setDone('p12_g2');
    }
  }
  f1.addEventListener('input', checkEq);
  f2.addEventListener('input', checkEq);
  f3.addEventListener('input', checkEq);
}

function initGameNetHub() {
  const hub = document.getElementById('dbms-core');
  if (!hub) return;
  let connectedNodes = 0;

  window.connectNode = (btn, name) => {
    if (btn.classList.contains('filled')) return;
    btn.classList.add('filled');
    btn.innerText = `✓ ${name} подключен (Луч активен)`;
    connectedNodes++;

    if (connectedNodes === 3) {
      hub.style.borderColor = '#10b981';
      hub.style.background = '#ecfdf5';
      hub.innerHTML = '<strong>✨ Двойной клик/тап: Синхронизировать СУБД</strong>';
    }
  };

  hub.addEventListener('dblclick', () => {
    if (connectedNodes < 3) return;
    const fb = document.getElementById('p12-g3-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Win State: Пространственные данные синхронизированы в единую государственную компьютерную систему!</strong> Распределенная СУБД активна.';
    LMS.setDone('p12_g3');
  });
}