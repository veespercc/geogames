/**
 * GIS & Cartography Unified Verification & Map Engine
 * Mobile-ready, Drawer-enabled, Pure JS
 */

const STATE_KEY = 'geo_master_progress_v3';

const App = {
  // Correct answers key strictly from geo.txt
  taskSolutions: {
    // § 5—6
    't_p5-6_1': { 'q1': 'B', 'q2': 'C' },
    't_p5-6_2': { 'q1': 'B', 'q2': 'A' },
    't_p5-6_3': { 'q1': { '1': 'B', '2': 'A', '3': 'C' }, 'q2': ['A', 'B', 'C', 'D'] },

    // § 7—8
    't_p7-8_1': { 'q1': 'A', 'q2': 'B' },
    't_p7-8_2': { 'q1': 'B', 'q2': 'C' },
    't_p7-8_3': { 'q1': 1, 'q2': ['A', 'B', 'D'] },

    // § 9—10
    't_p9-10_1': { 'q1': ['layer_base', 'layer_forest', 'layer_roads', 'layer_fires'], 'q2': 'B' },
    't_p9-10_2': { 'q1': 'B', 'q2': 'A' },
    't_p9-10_3': { 'q1': { '1': 'B', '2': 'C', '3': 'A' } },

    // § 11
    't_p11_1': { 'q1': 'A', 'q2': 'B' },
    't_p11_2': { 'q1': ['A', 'B', 'D'], 'q2': 'A' },
    't_p11_3': { 'q1': 'B', 'q2': 'D' },

    // § 12
    't_p12_1': { 'q1': { '1': 'B', '2': 'C', '3': 'A' }, 'q2': 'A' },
    't_p12_2': { 'q1': 'A', 'q2': 'B', 'q3': 'C' },
    't_p12_3': { 'q1': ['A', 'B', 'C'], 'q2': 'B' }
  },

  getState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    this.updateProgressUI();
  },

  init() {
    this.bindEvents();
    this.initMobileDrawer();
    this.initMapInteractions();
    this.initLayerSorter();
    this.updateProgressUI();
    this.restoreState();
  },

  bindEvents() {
    document.querySelectorAll('[data-task-submit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.getAttribute('data-task-submit');
        this.verifyTask(taskId);
      });
    });
  },

  // Mobile Drawer handler
  initMobileDrawer() {
    const toggleBtn = document.getElementById('mobile_menu_toggle');
    const sidebar = document.getElementById('app_sidebar');
    const backdrop = document.getElementById('sidebar_backdrop');
    const closeBtn = document.getElementById('mobile_drawer_close');

    const openDrawer = () => {
      if (sidebar && backdrop) {
        sidebar.classList.add('open');
        backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    };

    const closeDrawer = () => {
      if (sidebar && backdrop) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
        document.body.style.overflow = '';
      }
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  },

  // Verification Engine
  verifyTask(taskId) {
    const taskSpec = this.taskSolutions[taskId];
    const feedbackEl = document.getElementById(`feedback_${taskId}`);
    if (!taskSpec || !feedbackEl) return;

    let isAllCorrect = true;
    let errorDetails = [];

    for (const [subKey, expected] of Object.entries(taskSpec)) {
      const fieldName = `${taskId}_${subKey}`;

      if (typeof expected === 'string') {
        const selected = document.querySelector(`input[name="${fieldName}"]:checked`);
        if (!selected) {
          isAllCorrect = false;
          errorDetails.push(`Вопрос ${subKey.toUpperCase()}: не выбран вариант.`);
        } else if (selected.value !== expected) {
          isAllCorrect = false;
          errorDetails.push(`Вопрос ${subKey.toUpperCase()}: неверный выбор.`);
        }
      }
      else if (typeof expected === 'number') {
        const input = document.getElementById(`input_${fieldName}`);
        if (!input || input.value.trim() === '') {
          isAllCorrect = false;
          errorDetails.push(`Вопрос ${subKey.toUpperCase()}: введите числовое значение.`);
        } else {
          const val = parseFloat(input.value.trim().replace(',', '.'));
          if (val !== expected) {
            isAllCorrect = false;
            errorDetails.push(`Вопрос ${subKey.toUpperCase()}: неверная величина.`);
          }
        }
      }
      else if (Array.isArray(expected) && document.querySelectorAll(`input[name="${fieldName}"][type="checkbox"]`).length > 0) {
        const checked = Array.from(document.querySelectorAll(`input[name="${fieldName}"]:checked`)).map(cb => cb.value);
        if (checked.length === 0) {
          isAllCorrect = false;
          errorDetails.push(`Вопрос ${subKey.toUpperCase()}: укажите пункты.`);
        } else {
          const isMatch = checked.length === expected.length && checked.every(v => expected.includes(v));
          if (!isMatch) {
            isAllCorrect = false;
            errorDetails.push(`Вопрос ${subKey.toUpperCase()}: отмечены не все правильные пункты.`);
          }
        }
      }
      else if (Array.isArray(expected) && document.getElementById(`sorter_${fieldName}`)) {
        const list = document.getElementById(`sorter_${fieldName}`);
        const currentOrder = Array.from(list.children).map(li => li.getAttribute('data-layer-id'));
        const isOrderMatch = currentOrder.length === expected.length && currentOrder.every((val, i) => val === expected[i]);
        if (!isOrderMatch) {
          isAllCorrect = false;
          errorDetails.push(`Вопрос ${subKey.toUpperCase()}: неверный порядок слоев (требуется снизу вверх).`);
        }
      }
      else if (typeof expected === 'object') {
        let allMatched = true;
        for (const [rowId, correctVal] of Object.entries(expected)) {
          const select = document.getElementById(`match_${fieldName}_${rowId}`);
          if (!select || !select.value || select.value !== correctVal) {
            allMatched = false;
            isAllCorrect = false;
          }
        }
        if (!allMatched) {
          errorDetails.push(`Вопрос ${subKey.toUpperCase()}: ошибки в сопоставлении.`);
        }
      }
    }

    const state = this.getState();
    state[taskId] = isAllCorrect;
    this.saveState(state);

    if (isAllCorrect) {
      feedbackEl.className = 'feedback-banner show correct';
      feedbackEl.innerHTML = '<strong>Задание зачтено!</strong> Все подвопросы и координатные расчеты выполнены верно.';
    } else {
      feedbackEl.className = 'feedback-banner show incorrect';
      feedbackEl.innerHTML = `<strong>Требуется исправление:</strong> ${errorDetails.join(' ')}`;
    }
  },

  updateProgressUI() {
    const state = this.getState();
    const modules = ['p5-6', 'p7-8', 'p9-10', 'p11', 'p12'];
    let totalSolved = 0;
    const totalTasks = Object.keys(this.taskSolutions).length;

    modules.forEach(mod => {
      const taskKeys = Object.keys(this.taskSolutions).filter(k => k.includes(mod));
      const solvedCount = taskKeys.filter(k => state[k] === true).length;
      totalSolved += solvedCount;

      const badge = document.getElementById(`badge_${mod}`);
      if (badge) {
        badge.textContent = `${solvedCount}/${taskKeys.length}`;
        if (solvedCount === taskKeys.length && taskKeys.length > 0) {
          badge.classList.add('done');
        } else {
          badge.classList.remove('done');
        }
      }
    });

    const statScore = document.getElementById('stat_total_score');
    if (statScore) statScore.textContent = `${totalSolved} / ${totalTasks}`;

    const mobileBadge = document.getElementById('mobile_header_progress');
    if (mobileBadge) mobileBadge.textContent = `${totalSolved}/${totalTasks}`;
  },

  restoreState() {
    const state = this.getState();
    Object.keys(state).forEach(taskId => {
      if (state[taskId]) {
        const feedbackEl = document.getElementById(`feedback_${taskId}`);
        if (feedbackEl) {
          feedbackEl.className = 'feedback-banner show correct';
          feedbackEl.innerHTML = '<strong>Задание зачтено ранее.</strong> Результат сохранен в системе.';
        }
      }
    });
  },

  initMapInteractions() {
    document.querySelectorAll('.map-feature').forEach(el => {
      const handleSelect = (e) => {
        const feature = e.currentTarget;
        const parentMap = feature.closest('.map-workspace');
        if (!parentMap) return;

        parentMap.querySelectorAll('.map-feature').forEach(f => f.classList.remove('active'));
        feature.classList.add('active');

        const name = feature.getAttribute('data-name') || 'Географический объект';
        const type = feature.getAttribute('data-geom') || 'Вектор';
        const coords = feature.getAttribute('data-coords') || 'Координаты зафиксированы';
        const attrs = feature.getAttribute('data-attrs') || 'Сведения отсутствуют';

        const coordDisplay = parentMap.querySelector('.map-coord-display');
        if (coordDisplay) coordDisplay.textContent = coords;

        const inspector = parentMap.querySelector('.map-inspector');
        if (inspector) {
          inspector.classList.add('show');
          inspector.innerHTML = `<strong>Выбран:</strong> ${name} (<code>${type}</code>)<br><span style="color: var(--ink-muted); font-size: 12px;">${attrs}</span>`;
        }
      };

      el.addEventListener('click', handleSelect);
    });

    window.setMapZoom = (level) => {
      const rasterMap = document.getElementById('raster_canvas_demo');
      const vectorMap = document.getElementById('vector_canvas_demo');
      const zoomLabel = document.getElementById('zoom_level_label');
      if (zoomLabel) zoomLabel.textContent = `${level}x`;

      if (rasterMap && vectorMap) {
        if (level === 1) {
          rasterMap.style.filter = 'none';
          rasterMap.style.transform = 'scale(1)';
          vectorMap.style.transform = 'scale(1)';
        } else if (level === 2) {
          rasterMap.style.filter = 'blur(1px) contrast(1.4)';
          rasterMap.style.transform = 'scale(1.15)';
          vectorMap.style.transform = 'scale(1.15)';
        } else if (level === 4) {
          rasterMap.style.filter = 'blur(2.5px) contrast(2)';
          rasterMap.style.transform = 'scale(1.3)';
          vectorMap.style.transform = 'scale(1.3)';
        }
      }
    };
  },

  initLayerSorter() {
    window.moveLayerItem = (btn, dir) => {
      const item = btn.closest('.layer-item');
      const list = item.parentElement;
      if (dir === -1 && item.previousElementSibling) {
        list.insertBefore(item, item.previousElementSibling);
      } else if (dir === 1 && item.nextElementSibling) {
        list.insertBefore(item.nextElementSibling, item);
      }
    };
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());