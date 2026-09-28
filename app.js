/**
 * GeoSpatial Core LMS - 15 Cartographic Tasks Engine
 */

const STORAGE_KEY = 'geospatial_carto_v4';

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
    const total = 15;
    const count = Object.keys(data).filter(k => data[k]).length;
    const percent = Math.round((count / total) * 100);

    const fill = document.getElementById('global-fill');
    const label = document.getElementById('global-label');
    if (fill) fill.style.width = `${percent}%`;
    if (label) label.innerText = `${count} / ${total} (${percent}%)`;

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
  initAllCartoTasks();
});

function initAllCartoTasks() {
  // § 5—6
  initTopoMarkupTask();
  initRasterVectorCompareTask();
  initHypsometricDensityTask();

  // § 7—8
  initKazEOSatPolarCorridorTask();
  initMarineNavCentresTask();
  initKazakhstanContractMonitoringTask();

  // § 9—10
  initLayerByLayerAssemblyTask();
  initPipelineBufferMapInfoTask();
  initGeoGraphGISThematicMapTask();

  // § 11
  initAbandonedFarmlandMicrosoftTask();
  initERMapperOreSearchTask();
  initSafeLogisticsRoutingTask();

  // § 12
  initVectorDigitizingPrimitivesTask();
  initCoordinateAndDateFixTask();
  initTopographic3DExtrusionTask();
}

/* ==========================================================================
   § 5—6. ЦИФРОВАЯ МОДЕЛЬ КАРТЫ
   ========================================================================== */

// 1. Интерактивная разметка топографической карты
function initTopoMarkupTask() {
  const container = document.getElementById('topo-markup-map');
  if (!container) return;

  let activeFeature = null;
  const tagged = new Set();
  const correct = {
    'feat-borehole': 'digital',
    'feat-pipeline': 'digital',
    'feat-marsh': 'digital',
    'feat-contour': 'metric',
    'feat-forest': 'semantic',
    'feat-village': 'general'
  };

  window.selectTopoFeature = (el, id) => {
    activeFeature = id;
    document.querySelectorAll('.map-clickable-feature').forEach(f => f.classList.remove('selected-feature'));
    el.classList.add('selected-feature');
    document.getElementById('topo-badges-menu').style.display = 'flex';
  };

  window.assignTopoCategory = (category) => {
    if (!activeFeature) return;
    const fb = document.getElementById('p56-t1-fb');

    if (correct[activeFeature] === category) {
      const el = document.getElementById(activeFeature);
      if (category === 'digital') el.setAttribute('stroke', '#0284c7');
      if (category === 'metric') el.setAttribute('stroke', '#ea580c');
      if (category === 'semantic') el.setAttribute('fill', '#16a34a');
      if (category === 'general') el.setAttribute('fill', '#4f46e5');

      tagged.add(activeFeature);
      document.getElementById('topo-markup-count').innerText = `Размечено: ${tagged.size} из 4 обязательных групп`;

      // Require well/pipeline/marsh + contour + forest + village
      if (tagged.size >= 4) {
        fb.className = 'status-callout ok show';
        fb.innerHTML = '<strong>Карта размечена!</strong> Все объекты топографической карты привязаны к слоям базы данных: Цифровая, Размерная, Смысловая и Общая.';
        LMS.setDone('p56_t1');
      }
    } else {
      fb.className = 'status-callout err show';
      fb.innerText = 'Неверная категория для данного топографического объекта!';
      setTimeout(() => fb.classList.remove('show'), 1500);
    }
  };
}

// 2. Сравнение растрового и векторного участка на карте
function initRasterVectorCompareTask() {
  const slider = document.getElementById('rv-zoom-slider');
  if (!slider) return;

  const rasterSide = document.getElementById('raster-half-canvas');
  const vectorSide = document.getElementById('vector-half-svg');
  let pixelMatrixIdentified = false;
  let roadAttributeBound = false;

  slider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    rasterSide.style.transform = `scale(${val})`;
    rasterSide.style.imageRendering = val > 1.3 ? 'pixelated' : 'auto';
    vectorSide.style.transform = `scale(${val})`;

    if (val >= 2.0 && !pixelMatrixIdentified) {
      document.getElementById('btn-matrix-pixel').style.display = 'inline-flex';
    }
  });

  window.confirmPixelMatrix = () => {
    pixelMatrixIdentified = true;
    document.getElementById('btn-matrix-pixel').style.display = 'none';
    document.getElementById('raster-badge-label').innerText = '✓ Матрица пикселей зафиксирована';
    checkRVComplete();
  };

  window.bindRoadAttributes = () => {
    roadAttributeBound = true;
    document.getElementById('road-attribute-card').style.display = 'block';
    document.getElementById('vector-road-line').setAttribute('stroke', '#16a34a');
    checkRVComplete();
  };

  function checkRVComplete() {
    if (pixelMatrixIdentified && roadAttributeBound) {
      const fb = document.getElementById('p56-t2-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Сравнение завершено!</strong> Растр определен как масштабируемая пиксельная матрица, а векторная дорога получила атрибуты базы данных (ул. Абая, асфальтобетон, 14м).';
      LMS.setDone('p56_t2');
    }
  }
}

// 3. Настройка плотности высотных точек на гипсометрической карте
function initHypsometricDensityTask() {
  const container = document.getElementById('hypso-map-container');
  if (!container) return;

  window.setHypsoMode = (mode) => {
    const wallLayer = document.getElementById('hypso-wall-layer');
    const contLayer = document.getElementById('hypso-cont-layer');
    const structLayer = document.getElementById('hypso-struct-layer');
    const fb = document.getElementById('p56-t3-fb');

    wallLayer.style.display = mode === 'wall' ? 'block' : 'none';
    contLayer.style.display = mode === 'cont' ? 'block' : 'none';
    structLayer.style.display = mode === 'struct' ? 'block' : 'none';

    if (mode === 'struct') {
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Структурный рельеф настроен!</strong> Высотные точки выровнены строго по линиям среднего гипсометрического уровня местности.';
      LMS.setDone('p56_t3');
    }
  };
}

/* ==========================================================================
   § 7—8. МЕТОДЫ ДИСТАНЦИОННОГО ЗОНДИРОВАНИЯ
   ========================================================================== */

// 1. Полярный коридор съемки KazEOSat-1
function initKazEOSatPolarCorridorTask() {
  const canvas = document.getElementById('kazeosat-eurasia-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let isTracing = false;
  let lineDrawn = false;
  let swathWidth = 10;
  let modeActive = false;

  function renderEurasiaMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Geographic baseline
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Kazakhstan land contour fill
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(150, 110); ctx.lineTo(270, 110); ctx.lineTo(280, 160); ctx.lineTo(140, 160);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Landmark anchors
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(190, 40, 6, 0, Math.PI * 2); ctx.fill(); // Taymyr
    ctx.beginPath(); ctx.arc(230, 230, 6, 0, Math.PI * 2); ctx.fill(); // India

    ctx.fillStyle = '#0f172a';
    ctx.font = '11px Inter';
    ctx.fillText('п-ов Таймыр (Север)', 130, 30);
    ctx.fillText('Север Индии', 240, 240);
    ctx.fillText('Казахстан (14 витков/сут)', 160, 135);

    if (lineDrawn) {
      ctx.strokeStyle = modeActive ? 'rgba(22, 163, 74, 0.45)' : 'rgba(37, 99, 235, 0.35)';
      ctx.lineWidth = swathWidth;
      ctx.beginPath();
      ctx.moveTo(190, 40); ctx.lineTo(210, 135); ctx.lineTo(230, 230);
      ctx.stroke();

      ctx.strokeStyle = modeActive ? '#16a34a' : '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(190, 40); ctx.lineTo(210, 135); ctx.lineTo(230, 230);
      ctx.stroke();
    }
  }
  renderEurasiaMap();

  canvas.addEventListener('pointerdown', () => isTracing = true);
  window.addEventListener('pointerup', () => {
    isTracing = false;
    if (lineDrawn) document.getElementById('corridor-controls').style.display = 'block';
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!isTracing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x, y, 4, 4);

    if (y > 210 && x > 210) {
      lineDrawn = true;
      renderEurasiaMap();
    }
  });

  const slider = document.getElementById('swath-slider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      swathWidth = parseInt(e.target.value);
      document.getElementById('swath-label').innerText = `${swathWidth} × ${swathWidth} км`;
      renderEurasiaMap();
      checkKazEOSat();
    });
  }

  window.toggleKazEOSatMode = (btn) => {
    modeActive = true;
    btn.classList.add('btn-primary');
    renderEurasiaMap();
    checkKazEOSat();
  };

  function checkKazEOSat() {
    if (lineDrawn && swathWidth >= 20 && modeActive) {
      const fb = document.getElementById('p78-t1-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Полярный коридор KazEOSat-1 утвержден!</strong> Трасса Таймыр—Индия покрыта полосой 20×20 км. Суточный охват спутника — 14 витков в панхроматическом и мультиспектральном режимах.';
      LMS.setDone('p78_t1');
    }
  }
}

// 2. Расстановка морских навигационных центров на карте мира
function initMarineNavCentresTask() {
  const container = document.getElementById('world-nav-map');
  if (!container) return;

  const targets = { 'slot-aore': 'AORE', 'slot-ior': 'IOR', 'slot-waas': 'WAAS', 'slot-msas': 'MSAS' };
  let placed = 0;
  let selectedBadge = null;

  window.selectNavBadge = (name, el) => {
    document.querySelectorAll('.token-chip-nav').forEach(c => c.classList.remove('selected'));
    if (selectedBadge === name) selectedBadge = null;
    else { selectedBadge = name; el.classList.add('selected'); }
  };

  window.dropNavBeacon = (slotId) => {
    if (!selectedBadge) return;
    const fb = document.getElementById('p78-t2-fb');

    if (targets[slotId] === selectedBadge) {
      const el = document.getElementById(slotId);
      if (el.classList.contains('placed-ok')) return;

      el.classList.add('placed-ok');
      el.innerText = `📡 [${selectedBadge}] Активен`;
      document.getElementById(`badge-${selectedBadge}`).classList.add('disabled');
      selectedBadge = null;
      placed++;

      if (placed === 4) {
        document.getElementById('nav-waves-layer').style.display = 'block';
        fb.className = 'status-callout ok show';
        fb.innerHTML = '<strong>Навигационная система развернута!</strong> AORE, IOR, WAAS и MSAS синхронизированы, точность GPS на карте мира достигла 1 метра.';
        LMS.setDone('p78_t2');
      }
    } else {
      fb.className = 'status-callout err show';
      fb.innerText = 'Неверная морская акватория для данного навигационного значка!';
      setTimeout(() => fb.classList.remove('show'), 1500);
    }
  };
}

// 3. Договорная карта космического мониторинга Казахстана
function initKazakhstanContractMonitoringTask() {
  const container = document.getElementById('kz-contract-svg');
  if (!container) return;

  const contractRegions = new Set(['aktobe', 'almaty', 'atyrau', 'vko', 'zko', 'karaganda', 'pavlodar', 'turkestan']);
  const activeRegions = new Set();
  let stationsPlaced = 0;

  window.toggleKZRegion = (el, regKey) => {
    const fb = document.getElementById('p78-t3-fb');

    if (contractRegions.has(regKey)) {
      el.classList.add('active-monitored');
      activeRegions.add(regKey);
      document.getElementById('kz-contract-count').innerText = `Активировано областей договора: ${activeRegions.size} из 8`;
      checkMonitoringDone();
    } else {
      fb.className = 'status-callout err show';
      fb.innerText = 'Предупреждение: Данная область не заключала договор космического мониторинга с «Казахстан Гарыш Сапары»!';
      setTimeout(() => fb.classList.remove('show'), 1600);
    }
  };

  window.placeAkmolaStation = () => {
    if (stationsPlaced < 3) {
      stationsPlaced++;
      document.getElementById(`akmola-station-${stationsPlaced}`).style.display = 'block';
      document.getElementById('station-btn').innerText = `Установить референц-станцию «Аэтапография» (${stationsPlaced}/3)`;
      checkMonitoringDone();
    }
  };

  function checkMonitoringDone() {
    if (activeRegions.size === 8 && stationsPlaced === 3) {
      const fb = document.getElementById('p78-t3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Космический геопортал активен!</strong> 8 областей Казахстана покрыты снимками мониторинга паводков и пожаров, а 3 станции «Аэтапография» зафиксировали опорную сеть Акмолинской области и Нур-Султана.';
      LMS.setDone('p78_t3');
    }
  }
}

/* ==========================================================================
   § 9—10. ОСОБЕННОСТИ ГИС-ТЕХНОЛОГИЙ
   ========================================================================== */

// 1. Послойная сборка географической карты
function initLayerByLayerAssemblyTask() {
  const stack = [];
  const valid = ['base', 'rivers', 'roads', 'forest'];
  const names = {
    'base': 'Опорный слой (географическое положение территории)',
    'rivers': 'Речная сеть',
    'roads': 'Автомобильные дороги',
    'forest': 'Лесной фонд'
  };

  window.dragGISLayer = (ev, id) => ev.dataTransfer.setData('text/plain', id);
  window.allowDrop = (ev) => ev.preventDefault();

  window.dropGISLayerToFrame = (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData('text/plain');
    const fb = document.getElementById('p910-t1-fb');

    if (stack.length === 0 && id !== 'base') {
      fb.className = 'status-callout err show';
      fb.innerText = 'Ошибка сборки! Первым на дно рамки укладывается «Опорный слой».';
      setTimeout(() => fb.classList.remove('show'), 1600);
      return;
    }

    if (!stack.includes(id)) {
      stack.push(id);
      document.getElementById(`map-layer-visual-${id}`).style.display = 'block';
      document.getElementById(`layer-chip-${id}`).classList.add('disabled');
      fb.classList.remove('show');
    }

    if (stack.length === 4) {
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Многослойная электронная карта собрана!</strong> Опорный слой закреплен на дне карты, гидрография, дороги и леса сформировали цельную геоинформационную модель.';
      LMS.setDone('p910_t1');
    }
  };
}

// 2. Построение буферной зоны вокруг трубопровода в MapInfo
function initPipelineBufferMapInfoTask() {
  const canvas = document.getElementById('pipeline-mapinfo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let isLassoing = false;
  let points = [];
  let bufferCreated = false;

  function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Forest patches & rivers
    ctx.fillStyle = '#dcfce7';
    ctx.fillRect(40, 20, 100, 80);
    ctx.fillRect(250, 140, 120, 70);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(180, 0); ctx.lineTo(180, 240); ctx.stroke();

    // Pipeline line
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(20, 120); ctx.lineTo(380, 120); ctx.stroke();

    ctx.fillStyle = '#9a3412';
    ctx.font = '11px Inter';
    ctx.fillText('Трасса нефтепровода', 50, 110);

    if (bufferCreated) {
      ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(15, 85, 370, 70, 14);
      ctx.fill(); ctx.stroke();
    }
  }
  renderMap();

  canvas.addEventListener('pointerdown', () => { isLassoing = true; points = []; });
  window.addEventListener('pointerup', () => {
    isLassoing = false;
    if (points.length > 8) document.getElementById('btn-create-buffer').style.display = 'inline-flex';
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!isLassoing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    points.push({ x, y });

    ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
    ctx.lineWidth = 14;
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  window.generateBufferCorridor = () => {
    bufferCreated = true;
    renderMap();
    document.getElementById('btn-create-buffer').style.display = 'none';
    document.getElementById('btn-calc-geom').style.display = 'inline-flex';
  };

  window.calculateBufferGeometry = () => {
    const fb = document.getElementById('p910-t2-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Геометрические расчеты MapInfo выполнены!</strong> Длина = 18.4 км, Ширина буфера = 500 м, Площадь отчуждения = 9.2 км², Периметр = 37.8 км.';
    LMS.setDone('p910_t2');
  };
}

// 3. Наложение картограмм и диаграмм на карту районов
function initGeoGraphGISThematicMapTask() {
  let hasBar = false, hasCarto = false, hasIso = false;

  window.dragGeoGraphModule = (ev, type) => ev.dataTransfer.setData('text/plain', type);

  window.dropOnDistrictMap = (ev, distId) => {
    ev.preventDefault();
    const type = ev.dataTransfer.getData('text/plain');

    if (distId === 'dist-center' && type === 'bar') {
      hasBar = true;
      document.getElementById('center-bar-visual').style.display = 'block';
      document.getElementById('badge-bar').classList.add('disabled');
    }
    if (distId === 'dist-north' && type === 'cartogram') {
      hasCarto = true;
      document.getElementById('north-carto-visual').style.display = 'block';
      document.getElementById('badge-carto').classList.add('disabled');
    }
    if (distId === 'dist-east' && type === 'isolines') {
      hasIso = true;
      document.getElementById('east-iso-visual').style.display = 'block';
      document.getElementById('badge-iso').classList.add('disabled');
    }
    checkGeoGraphDone();
  };

  function checkGeoGraphDone() {
    if (hasBar && hasCarto && hasIso) {
      const fb = document.getElementById('p910-t3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Тематическая карта «ГеоГраф ГИС» построена!</strong> На район нанесена блок-диаграмма, северный окрашен картограммой по плотности данных, а на востоке прорисованы изолинии рельефа.';
      LMS.setDone('p910_t3');
    }
  }
}

/* ==========================================================================
   § 11. СВЯЗЬ ГИС С ОТРАСЛЯМИ
   ========================================================================== */

// 1. Мониторинг заброшенных пашен на карте сельхозугодий
function initAbandonedFarmlandMicrosoftTask() {
  const container = document.getElementById('farmland-cadastre-map');
  if (!container) return;

  let ownerActive = false;
  let termActive = false;

  window.revealUnusedField = () => {
    document.getElementById('field-status-overlay').style.background = '#fef3c7';
    document.getElementById('field-audit-card').style.display = 'block';
  };

  window.toggleFieldTag = (tagType, btn) => {
    if (tagType === 'owner') ownerActive = true;
    if (tagType === 'term') termActive = true;
    btn.classList.add('btn-primary');

    if (ownerActive && termActive) {
      const fb = document.getElementById('p11-t1-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Участок зафиксирован!</strong> Алгоритм программы Microsoft определил собственника и срок неиспользования пашни (2 года). Поле внесено в реестр программы «Цифровой Казахстан».';
      LMS.setDone('p11_t1');
    }
  };
}

// 2. Поиск рудных очагов на космической карте ER Mapper
function initERMapperOreSearchTask() {
  const pad = document.getElementById('ermapper-satellite-pad');
  if (!pad) return;

  const targetX = 260;
  const targetY = 90;
  let anomalyHit = false;

  pad.addEventListener('pointermove', (e) => {
    const rect = pad.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const reticle = document.getElementById('ermapper-reticle');
    reticle.style.left = `${x}px`;
    reticle.style.top = `${y}px`;

    const dist = Math.hypot(x - targetX, y - targetY);
    if (dist < 32) {
      reticle.style.borderColor = '#dc2626';
      reticle.style.background = 'rgba(220, 38, 38, 0.4)';
      document.getElementById('btn-drop-gps-ore').style.display = 'inline-flex';
      anomalyHit = true;
    } else {
      reticle.style.borderColor = '#2563eb';
      reticle.style.background = 'rgba(37, 99, 235, 0.15)';
    }
  });

  window.dropOreGpsPin = () => {
    if (!anomalyHit) return;
    const fb = document.getElementById('p11-t2-fb');
    fb.className = 'status-callout ok show';
    fb.innerHTML = '<strong>Высокоминерализованный очаг грунта зафиксирован!</strong> ER Mapper определил спектральную аномалию, на точку поставлен значок «GPS-навигатор: полевая привязка месторождения».';
    LMS.setDone('p11_t2');
  };
}

// 3. Прокладка безопасного транспортного маршрута
function initSafeLogisticsRoutingTask() {
  const canvas = document.getElementById('logistics-safe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let isTracing = false;
  let isFailed = false;

  function renderRoadMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hazard polygons
    ctx.fillStyle = '#bfdbfe'; // Flood
    ctx.fillRect(100, 20, 110, 80);
    ctx.fillStyle = '#1e40af'; ctx.font = '10px Inter';
    ctx.fillText('Зона паводка (Затоплено)', 105, 65);

    ctx.fillStyle = '#fecaca'; // Fire
    ctx.fillRect(100, 120, 110, 80);
    ctx.fillStyle = '#991b1b';
    ctx.fillText('Очаг лесного пожара', 110, 165);

    // Highways
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 6;
    // Highway top bypass
    ctx.beginPath(); ctx.moveTo(30, 110); ctx.lineTo(100, 10); ctx.lineTo(310, 10); ctx.lineTo(370, 110); ctx.stroke();
    // Highway center (through hazard)
    ctx.beginPath(); ctx.moveTo(30, 110); ctx.lineTo(370, 110); ctx.stroke();

    // Logistic Hubs
    ctx.fillStyle = '#16a34a'; ctx.fillRect(10, 95, 45, 30);
    ctx.fillStyle = '#fff'; ctx.fillText('Парк А', 14, 114);

    ctx.fillStyle = '#2563eb'; ctx.fillRect(345, 95, 45, 30);
    ctx.fillStyle = '#fff'; ctx.fillText('Город Б', 350, 114);
  }
  renderRoadMap();

  canvas.addEventListener('pointerdown', () => { isTracing = true; isFailed = false; renderRoadMap(); });
  window.addEventListener('pointerup', () => {
    isTracing = false;
    if (!isFailed) {
      const fb = document.getElementById('p11-t3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Безопасный маршрут утвержден!</strong> Колонна направлена по свободной автомагистрали в обход зон затопления и лесного пожара с расчетом максимального грузооборота.';
      LMS.setDone('p11_t3');
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isTracing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x, y, 4, 4);

    // Check hazard zones
    if ((x > 100 && x < 210 && y > 20 && y < 100) || (x > 100 && x < 210 && y > 120 && y < 200) || (x > 100 && x < 210 && y > 100 && y < 120)) {
      isFailed = true;
      const fb = document.getElementById('p11-t3-fb');
      fb.className = 'status-callout err show';
      fb.innerText = 'Маршрут пересек зону опасности (паводок / огонь)! Проведите колонну по свободному объезду сверху.';
    }
  });
}

/* ==========================================================================
   § 12. ГЕОГРАФИЧЕСКАЯ БАЗА ДАННЫХ
   ========================================================================== */

// 1. Оцифровка объектов на карте в «Точку, Линию, Полигон»
function initVectorDigitizingPrimitivesTask() {
  let tool = null;
  let repDone = false, pipeDone = false, zaysanDone = false, soilDone = false;

  window.setDigitizeTool = (t, btn) => {
    tool = t;
    document.querySelectorAll('.btn-tool-dig').forEach(b => b.classList.remove('btn-primary'));
    btn.classList.add('btn-primary');
  };

  window.digitizeMapFeature = (type, elId) => {
    const fb = document.getElementById('p12-t1-fb');

    if (type === 'point' && tool === 'point') {
      repDone = true;
      document.getElementById('feat-repar-point').setAttribute('fill', '#16a34a');
    } else if (type === 'line' && tool === 'line') {
      pipeDone = true;
      document.getElementById('feat-pipeline-line').setAttribute('stroke', '#16a34a');
    } else if (type === 'poly' && tool === 'poly') {
      if (elId === 'feat-zaysan-poly') zaysanDone = true;
      if (elId === 'feat-soils-poly') soilDone = true;
      document.getElementById(elId).setAttribute('stroke', '#16a34a');
    } else {
      fb.className = 'status-callout err show';
      fb.innerText = 'Несоответствие инструмента типу геометрического примитива (Точка / Линия / Полигон)!';
      setTimeout(() => fb.classList.remove('show'), 1500);
      return;
    }

    if (repDone && pipeDone && zaysanDone && soilDone) {
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Объекты оцифрованы по ГОСТу!</strong> Геодезический пункт (Точка, 0D), трубопровод (Линия, 1D), озеро Зайсан и контур каштановых почв (Полигоны, 2D) занесены в векторную базу данных.';
      LMS.setDone('p12_t1');
    }
  };
}

// 2. Исправление ошибок координат и дат прямо на карте
function initCoordinateAndDateFixTask() {
  let bridgeOnRiver = false;
  let floodUpdated = false;

  window.dragBridgeSymbol = (ev) => ev.dataTransfer.setData('text/plain', 'bridge');
  window.allowDrop = (ev) => ev.preventDefault();

  window.dropBridgeToRiverAlignment = (ev) => {
    ev.preventDefault();
    bridgeOnRiver = true;
    const bridge = document.getElementById('bridge-feature-item');
    bridge.style.left = '175px';
    bridge.style.top = '100px';
    document.getElementById('bridge-coord-status').innerText = '✓ Мост состыкован с руслом реки (Точность: Соблюдена)';
    checkCoordDateDone();
  };

  window.applyFreshSatelliteFlood = () => {
    floodUpdated = true;
    document.getElementById('flood-date-badge').innerText = '✓ Свежий космический снимок: Сегодня (Своевременность: Соблюдена)';
    document.getElementById('btn-update-flood-date').style.display = 'none';
    checkCoordDateDone();
  };

  function checkCoordDateDone() {
    if (bridgeOnRiver && floodUpdated) {
      const fb = document.getElementById('p12-t2-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>Карта исправлена!</strong> Требование ТОЧНОСТИ (пространственная привязка моста) и СВОЕВРЕМЕННОСТИ (актуальная дата паводковой обстановки) полностью выполнены.';
      LMS.setDone('p12_t2');
    }
  }
}

// 3. 3D-подъем рельефа на топографической карте
function initTopographic3DExtrusionTask() {
  const sheet = document.getElementById('topo-3d-sheet');
  const slider = document.getElementById('topo-tilt-slider');
  if (!sheet || !slider) return;

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    sheet.style.transform = `rotateX(${val * 0.65}deg) rotateZ(${-val * 0.25}deg)`;

    const isolines = document.querySelectorAll('.topo-extruded-contour');
    isolines.forEach((iso, idx) => {
      iso.style.transform = `translateZ(${val * (idx + 1) * 0.5}px)`;
    });

    if (val >= 75) {
      const fb = document.getElementById('p12-t3-fb');
      fb.className = 'status-callout ok show';
      fb.innerHTML = '<strong>3D-модель рельефа сформирована!</strong> Плоские горизонтали топографической карты вытянулись вверх, образовав наглядную трехмерную цифровую модель высот и склонов.';
      LMS.setDone('p12_t3');
    }
  });
}