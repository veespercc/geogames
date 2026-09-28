/**
 * GeoSpatial Core LMS - Engine for 15 Interactive Map Mini-Games
 */

const STORAGE_KEY = 'geospatial_map_games_v3';

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
  initAllMapGames();
});

function initAllMapGames() {
  // § 5—6
  initPinchDefectMap();
  initRadialClassifierMap();
  initStructuralReliefMap();

  // § 7—8
  initKazEOSatOrbitMap();
  initFloodPortalMap();
  initGeodeticTriangleMap();

  // § 9—10
  initMultiLayerGISMap();
  initMapInfoLassoMap();
  initGeoGraphGISManipulator();

  // § 11
  initMicrosoftAgroRadarMap();
  initERMapperProbeMap();
  initLogisticsTracerMap();

  // § 12
  initTopologicalStencilMap();
  initCoordinateInspectorMap();
  init3DReliefTransformerMap();
}

/* ==========================================================================
   § 5—6. ЦИФРОВАЯ МОДЕЛЬ КАРТЫ
   ========================================================================== */

// 1. «Pinch-дефектоскопия на цифровой карте местности»
function initPinchDefectMap() {
  const container = document.getElementById('pinch-map-container');
  if (!container) return;

  let mode = 'raster'; // raster | vector
  let zoom = 1.0;
  let rasterBugFixed = false;
  let vectorBoundFixed = false;

  const rasterLayer = document.getElementById('map-raster-layer');
  const vectorLayer = document.getElementById('map-vector-layer');
  const zoomSlider = document.getElementById('pinch-zoom-slider');

  window.setMapRenderMode = (newMode) => {
    mode = newMode;
    document.getElementById('btn-mode-raster').classList.toggle('active', mode === 'raster');
    document.getElementById('btn-mode-vector').classList.toggle('active', mode === 'vector');
    rasterLayer.style.display = mode === 'raster' ? 'block' : 'none';
    vectorLayer.style.display = mode === 'vector' ? 'block' : 'none';
  };

  zoomSlider.addEventListener('input', (e) => {
    zoom = parseFloat(e.target.value);
    rasterLayer.style.transform = `scale(${zoom})`;
    rasterLayer.style.imageRendering = zoom > 1.5 ? 'pixelated' : 'auto';
    vectorLayer.style.transform = `scale(${zoom})`;

    if (mode === 'raster' && zoom >= 2.0 && !rasterBugFixed) {
      document.getElementById('trigger-pixel-matrix').style.display = 'inline-flex';
    }
    if (mode === 'vector' && zoom >= 2.0 && !vectorBoundFixed) {
      document.getElementById('river-vector-path').setAttribute('stroke', '#ef4444');
    }
  });

  window.fixRasterBug = () => {
    rasterBugFixed = true;
    document.getElementById('trigger-pixel-matrix').style.display = 'none';
    document.getElementById('raster-status-text').innerText = '✓ Зафиксирована матрица пикселей';
    checkTaskDone();
  };

  window.dragAttrDB = (ev) => ev.dataTransfer.setData('text/plain', 'db_table');
  window.allowDrop = (ev) => ev.preventDefault();

  window.dropAttrOnRiver = (ev) => {
    ev.preventDefault();
    vectorBoundFixed = true;
    const river = document.getElementById('river-vector-path');
    river.setAttribute('stroke', '#0284c7');
    document.getElementById('chip-attr-db').classList.add('disabled');
    document.getElementById('vector-status-text').innerText = '✓ Таблица атрибутов БД привязана к реке';
    checkTaskDone();
  };

  function checkTaskDone() {
    if (rasterBugFixed && vectorBoundFixed) {
      const fb = document.getElementById('p56-g1-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Карта валидирована!</strong> Растровый слой распознан как матрица пикселей, векторная река связана с атрибутами БД.';
      LMS.setDone('p56_m1');
    }
  }
}

// 2. «Интерактивный классификатор объектов на карте»
function initRadialClassifierMap() {
  const container = document.getElementById('classifier-map');
  if (!container) return;

  const radial = document.getElementById('radial-selector');
  let activeTarget = null;
  let classifiedCount = 0;
  const correct = {
    'obj-well': 'digital',
    'obj-relief': 'metric',
    'obj-forest': 'semantic',
    'obj-name': 'general'
  };

  window.openRadialMenu = (ev, targetId) => {
    ev.stopPropagation();
    activeTarget = targetId;
    const rect = container.getBoundingClientRect();
    radial.style.left = `${ev.clientX - rect.left}px`;
    radial.style.top = `${ev.clientY - rect.top}px`;
    radial.style.display = 'block';
  };

  container.addEventListener('click', () => { radial.style.display = 'none'; });

  window.chooseRadialSector = (sectorType) => {
    radial.style.display = 'none';
    if (!activeTarget) return;

    if (correct[activeTarget] === sectorType) {
      const el = document.getElementById(activeTarget);
      el.classList.add('classified-ok');
      if (sectorType === 'digital') el.setAttribute('fill', '#0284c7');
      if (sectorType === 'metric') el.setAttribute('stroke', '#10b981');
      if (sectorType === 'semantic') el.setAttribute('fill', '#059669');
      if (sectorType === 'general') el.setAttribute('fill', '#4f46e5');

      classifiedCount++;
      if (classifiedCount === 4) {
        const fb = document.getElementById('p56-g2-fb');
        fb.className = 'status-callout ok show';
        fb.innerHTML = '<strong>Win State: Все 4 объекта классифицированы!</strong> Объекты окрашены в цвета своих информационных слоев.';
        LMS.setDone('p56_m2');
      }
    } else {
      const fb = document.getElementById('p56-g2-fb');
      fb.className = 'status-callout err show';
      fb.innerText = 'Неверная категория информации для этого объекта! Попробуйте снова.';
      setTimeout(() => fb.classList.remove('show'), 1400);
    }
  };
}

// 3. «Формирователь структурного рельефа карты»
function initStructuralReliefMap() {
  const canvas = document.getElementById('structural-relief-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let currentMode = 'wall'; // wall | continuous | structural

  function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentMode === 'wall') {
      ctx.fillStyle = '#4f46e5';
      ctx.font = '11px Inter';
      ctx.fillText('▲ Холм (Качественный знак)', 70, 110);
      ctx.fillText('■ Котловина (Качественный знак)', 220, 150);
    } else if (currentMode === 'continuous') {
      ctx.fillStyle = '#0284c7';
      for (let x = 30; x < 370; x += 12) {
        for (let y = 30; y < 190; y += 12) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
      ctx.fillStyle = '#0369a1';
      ctx.fillText('Непрерывная сетка частых точек', 40, 20);
    } else if (currentMode === 'structural') {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(120, 100, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(270, 110, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#065f46';
      ctx.fillText('● Ср. уровень рельефа H=150м', 60, 105);
      ctx.fillText('● Ср. уровень рельефа H=90м', 210, 115);
    }
  }
  renderMap();

  window.setReliefGenMode = (m) => {
    currentMode = m;
    renderMap();

    if (m === 'structural') {
      const fb = document.getElementById('p56-g3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Структурная цифровая модель сформирована!</strong> Точки рельефа зафиксированы строго по среднему высотному уровню.';
      LMS.setDone('p56_m3');
    }
  };
}

/* ==========================================================================
   § 7—8. МЕТОДЫ ДИСТАНЦИОННОГО ЗОНДИРОВАНИЯ
   ========================================================================== */

// 1. «Орбитальная проекция KazEOSat-1»
function initKazEOSatOrbitMap() {
  const canvas = document.getElementById('kazeosat-orbit-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let isTracing = false;
  let traceComplete = false;
  let swathWidth = 10;
  let isSensorPanMulti = false;

  function renderBase() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Target points
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(80, 40, 6, 0, Math.PI * 2); // Taymyr
    ctx.arc(320, 200, 6, 0, Math.PI * 2); // India
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.font = '11px Inter';
    ctx.fillText('п-ов Таймыр (Север)', 20, 30);
    ctx.fillText('Север Индии', 280, 225);
    ctx.fillText('Территория Казахстана', 140, 120);

    if (traceComplete) {
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
      ctx.lineWidth = swathWidth;
      ctx.beginPath();
      ctx.moveTo(80, 40);
      ctx.lineTo(200, 120);
      ctx.lineTo(320, 200);
      ctx.stroke();

      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 40);
      ctx.lineTo(200, 120);
      ctx.lineTo(320, 200);
      ctx.stroke();
    }
  }
  renderBase();

  canvas.addEventListener('pointerdown', () => { isTracing = true; });
  window.addEventListener('pointerup', () => {
    isTracing = false;
    if (traceComplete) {
      document.getElementById('swath-control-panel').style.display = 'block';
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isTracing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(x, y, 4, 4);

    if (x > 290 && y > 180) {
      traceComplete = true;
      renderBase();
    }
  });

  const swathSlider = document.getElementById('swath-slider');
  if (swathSlider) {
    swathSlider.addEventListener('input', (e) => {
      swathWidth = parseInt(e.target.value);
      document.getElementById('swath-val-label').innerText = `${swathWidth} × ${swathWidth} км`;
      renderBase();
      checkKazEOSatDone();
    });
  }

  window.togglePanMultiSensor = (btn) => {
    isSensorPanMulti = true;
    btn.classList.add('btn-primary');
    btn.innerText = '✓ [Панхроматический + Мультиспектральный: ВКЛ]';
    checkKazEOSatDone();
  };

  function checkKazEOSatDone() {
    if (traceComplete && swathWidth >= 20 && isSensorPanMulti) {
      const fb = document.getElementById('p78-g1-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: KazEOSat-1 выведен на заданный коридор!</strong> Полоса 20×20 км покрывает маршрут Таймыр—Индия, зафиксировано 14 суточных оборотов.';
      LMS.setDone('p78_m1');
    }
  }
}

// 2. «Геопортал противопаводкового мониторинга Казахстана»
function initFloodPortalMap() {
  const container = document.getElementById('flood-portal-svg');
  if (!container) return;

  const validRegions = [
    'aktobe', 'almaty', 'atyrau', 'vko', 'zko', 'karaganda', 'pavlodar', 'turkestan'
  ];
  let selectedRegions = new Set();

  window.handleRegionClick = (el, regKey) => {
    const fb = document.getElementById('p78-g2-fb');

    if (validRegions.includes(regKey)) {
      el.classList.add('active-monitored');
      selectedRegions.add(regKey);
      document.getElementById('flood-counter').innerText = `Активировано: ${selectedRegions.size} из 8 областей договора`;

      if (selectedRegions.size === 8) {
        fb.className = 'status-callout ok show';
        fb.innerHTML = '<strong>Win State: Космический мониторинг активен!</strong> Все 8 областей договора с «Қазақстан Ғарыш Сапары» подключены к геопорталу МЧС/КЧС.';
        LMS.setDone('p78_m2');
      }
    } else {
      fb.className = 'status-callout err show';
      fb.innerText = 'Предупреждение: Данная область не заключала договор на оперативный мониторинг с «Қазақстан Ғарыш Сапары»!';
      setTimeout(() => fb.classList.remove('show'), 2000);
    }
  };
}

// 3. «Наземный геодезический треугольник опорных станций»
function initGeodeticTriangleMap() {
  const canvas = document.getElementById('geodetic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stations = [];
  let gpsPlaced = false;

  function renderTriangle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // City center (Nur-Sultan)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(200, 120, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '11px Inter';
    ctx.fillText('Нур-Султан (Акмолинская обл.)', 140, 105);

    // Draw reference stations
    ctx.fillStyle = '#4f46e5';
    stations.forEach((st, idx) => {
      ctx.beginPath();
      ctx.arc(st.x, st.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`Станция ${idx+1}`, st.x + 10, st.y + 4);
    });

    // Draw radio link triangle if 3 stations exist
    if (stations.length === 3) {
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(stations[0].x, stations[0].y);
      ctx.lineTo(stations[1].x, stations[1].y);
      ctx.lineTo(stations[2].x, stations[2].y);
      ctx.closePath();
      ctx.stroke();

      if (gpsPlaced) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fill();
      }
    }

    if (gpsPlaced) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(200, 130, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('📡 GPS-приемник: Точность ≤ 1м', 140, 155);
    }
  }
  renderTriangle();

  canvas.addEventListener('click', (e) => {
    if (stations.length < 3) {
      const rect = canvas.getBoundingClientRect();
      stations.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      renderTriangle();

      if (stations.length === 3) {
        document.getElementById('gps-place-trigger').style.display = 'inline-flex';
      }
    }
  });

  window.placeGpsReceiver = () => {
    gpsPlaced = true;
    renderTriangle();
    const fb = document.getElementById('p78-g3-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Win State: Геодезический купол связи активирован!</strong> «Аэтапография» зафиксировала точность определения координат до 1 метра.';
    LMS.setDone('p78_m3');
  };
}

/* ==========================================================================
   § 9—10. ОСОБЕННОСТИ ГИС-ТЕХНОЛОГИЙ
   ========================================================================== */

// 1. «Конструктор многослойной электронной карты»
function initMultiLayerGISMap() {
  const stack = [];
  const validOrder = ['base', 'hydro', 'forest', 'roads'];
  const names = {
    'base': 'Опорный слой (географическое положение)',
    'hydro': 'Гидрография',
    'forest': 'Лесной фонд',
    'roads': 'Дорожная сеть'
  };

  window.dragGISLayer = (ev, id) => ev.dataTransfer.setData('text/plain', id);
  window.allowDrop = (ev) => ev.preventDefault();

  window.dropGISLayerOnTable = (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData('text/plain');
    const fb = document.getElementById('p910-g1-fb');

    if (stack.length === 0 && id !== 'base') {
      fb.className = 'status-callout err show';
      fb.innerText = 'Ошибка! На самое дно рабочего стола карты необходимо положить [Опорный слой (геоположение)].';
      setTimeout(() => fb.classList.remove('show'), 2000);
      return;
    }

    if (!stack.includes(id)) {
      stack.push(id);
      const slot = document.getElementById(`gis-slot-${stack.length}`);
      slot.classList.add('filled');
      slot.innerText = `${id === 'base' ? '🔒' : '📄'} Слой ${stack.length}: ${names[id]}`;
      document.getElementById(`chip-layer-${id}`).classList.add('disabled');
      fb.classList.remove('show');
    }

    if (stack.length === 4) {
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Многослойная электронная карта создана!</strong> Опорный слой зафиксирован замком, тематические слои распределены.';
      LMS.setDone('p910_m1');
    }
  };
}

// 2. «Лассо-генератор буферной зоны MapInfo»
function initMapInfoLassoMap() {
  const canvas = document.getElementById('mapinfo-lasso-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let isDrawing = false;
  let points = [];
  let bufferCreated = false;

  function renderPipeline() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(360, 120);
    ctx.stroke();

    ctx.fillStyle = '#0369a1';
    ctx.font = '11px Inter';
    ctx.fillText('Магистральный газопровод', 130, 105);

    if (bufferCreated) {
      ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(30, 80, 340, 80, 20);
      ctx.fill();
      ctx.stroke();
    }
  }
  renderPipeline();

  canvas.addEventListener('pointerdown', () => { isDrawing = true; points = []; });
  window.addEventListener('pointerup', () => {
    isDrawing = false;
    if (points.length > 10) {
      document.getElementById('btn-create-buffer').style.display = 'inline-flex';
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    points.push({ x, y });

    ctx.strokeStyle = 'rgba(79, 70, 229, 0.5)';
    ctx.lineWidth = 14;
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  window.createMapInfoBuffer = () => {
    bufferCreated = true;
    renderPipeline();
    document.getElementById('btn-create-buffer').style.display = 'none';
    document.getElementById('btn-geom-calc').style.display = 'inline-flex';
  };

  window.calcMapInfoGeometry = () => {
    const fb = document.getElementById('p910-g2-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Win State: Буферная зона сформирована!</strong> MapInfo рассчитал геометрию: Площадь отчуждения = 24.5 га, Периметр = 4.8 км.';
    LMS.setDone('p910_m2');
  };
}

// 3. «Пространственный манипулятор "ГеоГраф ГИС"»
function initGeoGraphGISManipulator() {
  let placedDiagram = false;
  let placedCartogram = false;
  let isolinesBuilt = false;

  window.dragManipulator = (ev, type) => ev.dataTransfer.setData('text/plain', type);
  window.allowDrop = (ev) => ev.preventDefault();

  window.dropOnDistrict = (ev, districtId) => {
    ev.preventDefault();
    const type = ev.dataTransfer.getData('text/plain');

    if (districtId === 'dist-center' && type === 'diagram') {
      placedDiagram = true;
      document.getElementById('dist-center-label').innerText = '📊 [Блок-диаграмма активна]';
      document.getElementById('chip-diagram').classList.add('disabled');
    }
    if (districtId === 'dist-side' && type === 'cartogram') {
      placedCartogram = true;
      document.getElementById('dist-side-label').innerText = '🗺️ [Картограмма активна]';
      document.getElementById('chip-cartogram').classList.add('disabled');
    }
    checkGeoGraphDone();
  };

  window.buildIsolines = (btn) => {
    isolinesBuilt = true;
    btn.classList.add('btn-primary');
    document.getElementById('dist-mountain-label').innerText = '〰️ [Изолинии рельефа построены]';
    checkGeoGraphDone();
  };

  function checkGeoGraphDone() {
    if (placedDiagram && placedCartogram && isolinesBuilt) {
      const fb = document.getElementById('p910-g3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Манипуляции «ГеоГраф ГИС» завершены!</strong> Карта обогащена блок-диаграммами, картограммой и рельефными изолиниями.';
      LMS.setDone('p910_m3');
    }
  }
}

/* ==========================================================================
   § 11. СВЯЗЬ ГИС С ОТРАСЛЯМИ
   ========================================================================== */

// 1. «Агро-радар неиспользуемых земель Microsoft»
function initMicrosoftAgroRadarMap() {
  const canvas = document.getElementById('agro-scratch-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let scratched = 0;
  let isScratching = false;

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1e293b';
  ctx.font = '12px Inter';
  ctx.fillText('Сотрите защитный серый слой с пашни...', 60, 75);

  canvas.addEventListener('pointerdown', () => isScratching = true);
  window.addEventListener('pointerup', () => isScratching = false);
  canvas.addEventListener('pointermove', (e) => {
    if (!isScratching) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    scratched++;
    if (scratched > 35) {
      document.getElementById('ms-field-card').style.display = 'block';
    }
  });

  window.claimUnusedField = () => {
    const fb = document.getElementById('p11-g1-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Win State: Земля зафиксирована в «Цифровой Казахстан»!</strong> Собственник установлен, срок неиспользования: 2 года.';
    LMS.setDone('p11_m1');
  };
}

// 2. «Спектральный геологический щуп ER Mapper»
function initERMapperProbeMap() {
  const pad = document.getElementById('ermapper-pad');
  if (!pad) return;

  const targetX = 230;
  const targetY = 85;
  let found = false;

  pad.addEventListener('pointermove', (e) => {
    const rect = pad.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lens = document.getElementById('ermapper-lens');
    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;

    const dist = Math.hypot(x - targetX, y - targetY);
    if (dist < 32) {
      lens.style.borderColor = '#ef4444';
      lens.style.background = 'rgba(239, 68, 68, 0.35)';
      if ('vibrate' in navigator) navigator.vibrate(40);
      document.getElementById('ermapper-gps-btn').style.display = 'inline-flex';
      found = true;
    } else {
      lens.style.borderColor = '#4f46e5';
      lens.style.background = 'rgba(79, 70, 229, 0.15)';
    }
  });

  window.dropGeologyGpsPin = () => {
    if (!found) return;
    const fb = document.getElementById('p11-g2-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Win State: Месторождение зафиксировано!</strong> Высокоминерализованный очаг грунта отмечен GPS-привязкой для геологов.';
    LMS.setDone('p11_m2');
  };
}

// 3. «Трассировщик логистических и кабельных сетей»
function initLogisticsTracerMap() {
  const canvas = document.getElementById('network-tracer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let cableDone = false;
  let freightDone = false;
  let isTracing = false;

  function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Red Danger Zone
    ctx.fillStyle = '#fee2e2';
    ctx.fillRect(100, 30, 100, 90);
    ctx.fillStyle = '#991b1b';
    ctx.font = '10px Inter';
    ctx.fillText('Зона риска ЧС', 115, 80);

    // Telecom Station & Houses
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(20, 20, 40, 25);
    ctx.fillStyle = '#fff';
    ctx.fillText('Вышка', 24, 37);

    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(320, 20, 50, 25);
    ctx.fillStyle = '#fff';
    ctx.fillText('Дома', 330, 37);

    // Freight Park & Logistic Hub
    ctx.fillStyle = '#10b981';
    ctx.fillRect(20, 140, 40, 25);
    ctx.fillStyle = '#fff';
    ctx.fillText('Парк', 25, 157);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(320, 140, 50, 25);
    ctx.fillStyle = '#fff';
    ctx.fillText('Хаб', 335, 157);
  }
  renderMap();

  canvas.addEventListener('pointerdown', () => isTracing = true);
  window.addEventListener('pointerup', () => isTracing = false);

  canvas.addEventListener('pointermove', (e) => {
    if (!isTracing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(x, y, 3, 3);

    // Trace cable at top
    if (y < 60 && x > 300) cableDone = true;
    // Trace freight at bottom
    if (y > 130 && x > 300) freightDone = true;

    if (cableDone && freightDone) {
      const fb = document.getElementById('p11-g3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Сети проложены успешно!</strong> Оптоволоконный кабель подключен, грузопоток направлен в обход зоны кризиса.';
      LMS.setDone('p11_m3');
    }
  });
}

/* ==========================================================================
   § 12. ГЕОГРАФИЧЕСКАЯ БАЗА ДАННЫХ
   ========================================================================== */

// 1. «Топологический трафарет пространственных объектов»
function initTopologicalStencilMap() {
  let currentTool = null;
  let pointDone = false;
  let lineDone = false;
  let polyDone = false;

  window.setTopoTool = (tool, btn) => {
    currentTool = tool;
    document.querySelectorAll('.btn-tool-topo').forEach(b => b.classList.remove('btn-primary'));
    btn.classList.add('btn-primary');
  };

  window.handleTopoObjectClick = (objType) => {
    const fb = document.getElementById('p12-g1-fb');

    if (objType === 'point' && currentTool === 'point') {
      pointDone = true;
      document.getElementById('topo-point-obj').setAttribute('fill', '#10b981');
    } else if (objType === 'line' && currentTool === 'line') {
      lineDone = true;
      document.getElementById('topo-road-obj').setAttribute('stroke', '#10b981');
    } else if (objType === 'poly' && currentTool === 'poly') {
      polyDone = true;
      document.getElementById('topo-lake-obj').setAttribute('fill', '#a7f3d0');
      document.getElementById('topo-lake-obj').setAttribute('stroke', '#10b981');
    } else {
      fb.className = 'status-callout err show';
      fb.innerText = 'Несоответствие инструмента и геометрического типа объекта!';
      setTimeout(() => fb.classList.remove('show'), 1200);
      return;
    }

    if (pointDone && lineDone && polyDone) {
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Все объекты оцифрованы по ГОСТу!</strong> Точка (координаты), Линия (длина) и Полигон (площадь: длина и ширина) занесены в БД.';
      LMS.setDone('p12_m1');
    }
  };
}

// 2. «Инспектор координатных и временных ошибок на карте»
function initCoordinateInspectorMap() {
  let bridgeCorrected = false;
  let timeUpdated = false;

  window.dragBridge = (ev) => ev.dataTransfer.setData('text/plain', 'bridge');
  window.allowDrop = (ev) => ev.preventDefault();

  window.dropBridgeOnRiver = (ev) => {
    ev.preventDefault();
    bridgeCorrected = true;
    const bridge = document.getElementById('bridge-symbol');
    bridge.style.left = '160px';
    bridge.style.top = '70px';
    document.getElementById('bridge-status-txt').innerText = '✓ Мост состыкован с рекой (Точность)';
    checkInspectorDone();
  };

  window.updateFloodLayer = () => {
    timeUpdated = true;
    document.getElementById('flood-time-tag').innerText = '✓ Свежий снимок: Сегодня 08:00 (Своевременность)';
    document.getElementById('btn-time-update').style.display = 'none';
    checkInspectorDone();
  };

  function checkInspectorDone() {
    if (bridgeCorrected && timeUpdated) {
      const fb = document.getElementById('p12-g2-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Ошибки устранены!</strong> Достигнуты требования ТОЧНОСТИ (пространственная привязка) и СВОЕВРЕМЕННОСТИ (актуальные данные).';
      LMS.setDone('p12_m2');
    }
  }
}

// 3. «3D-трансформер картографического рельефа»
function init3DReliefTransformerMap() {
  const surface = document.getElementById('tilt-map-surface');
  const slider = document.getElementById('tilt-3d-slider');
  if (!surface || !slider) return;

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    surface.style.transform = `rotateX(${val * 0.6}deg) rotateZ(${-val * 0.3}deg)`;

    const isolines = document.querySelectorAll('.tilt-isoline');
    isolines.forEach((iso, idx) => {
      iso.style.transform = `translateZ(${val * (idx + 1) * 0.4}px)`;
    });

    if (val >= 80) {
      const fb = document.getElementById('p12-g3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Win State: Плоская основа превращена в 3D-модель!</strong> Изолинии рельефа сформировали объемные перепады высот местности.';
      LMS.setDone('p12_m3');
    }
  });
}