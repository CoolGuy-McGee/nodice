document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById('start-game');
  const optionsBtn = document.getElementById('options-btn');

  const modal = document.getElementById('options-modal');
  const modalBackdrop = modal ? modal.querySelector('.modal-backdrop') : null;
  const playerInput = document.getElementById('player-count');

  // Ensure modal is hidden by default (fix "open by default" bug)
  if (modal) modal.hidden = true;

  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  const panels = Array.from(document.querySelectorAll('.options-panel'));
  const saveDiceBtn = document.getElementById('save-dice-scores');
  const resetDiceBtn = document.getElementById('reset-dice-scores');
  const closeOptionsBottom = document.getElementById('close-options-bottom');

  const DEFAULT_DICE_SCORES = {
    one_5: 50, one_1: 100,
    three_1: 1000, three_2: 200, three_3: 300, three_4: 400, three_5: 500, three_6: 600,
    four_any: 1000, five_any: 2000, six_any: 3000,
    straight: 1500, two_triplets: 2500, four_any_w_pair: 2500,
    first_run_min: 300
  };

  const STORAGE_KEY = "nodice_custom_opts";

  function loadSavedOptions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveOptions(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {}
  }

  function populateDiceFormFrom(obj) {
    const form = document.getElementById('dice-scores-form');
    if (!form) return;
    const data = Object.assign({}, DEFAULT_DICE_SCORES, obj?.diceScores || {});
    for (const k of Object.keys(DEFAULT_DICE_SCORES)) {
      const el = form.querySelector(`[name="${k}"]`);
      if (el) el.value = String(data[k] ?? DEFAULT_DICE_SCORES[k]);
    }
  }

  function readDiceFormValues() {
    const form = document.getElementById('dice-scores-form');
    if (!form) return null;
    const out = {};
    for (const k of Object.keys(DEFAULT_DICE_SCORES)) {
      const el = form.querySelector(`[name="${k}"]`);
      const v = el ? parseInt(el.value, 10) : DEFAULT_DICE_SCORES[k];
      out[k] = Number.isFinite(v) ? v : DEFAULT_DICE_SCORES[k];
    }
    return out;
  }

  function formDiffersFromDefaults() {
    const vals = readDiceFormValues();
    if (!vals) return false;
    for (const k of Object.keys(DEFAULT_DICE_SCORES)) {
      if ((vals[k] ?? DEFAULT_DICE_SCORES[k]) !== DEFAULT_DICE_SCORES[k]) return true;
    }
    return false;
  }

  function applyActiveTabState() {
    const activeBtn = tabButtons.find(b => b.classList.contains('active')) || tabButtons[0];
    if (!activeBtn) return;
    tabButtons.forEach(b => {
      const isActive = b === activeBtn;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? "true" : "false");
    });
    const target = activeBtn.dataset.tab;
    panels.forEach(p => {
      const pid = p.id || "";
      const match = pid === target || pid === `${target}-panel`;
      p.hidden = !match;
    });
  }

  let lastFocused = null;
  if (optionsBtn && modal) {
    optionsBtn.addEventListener('click', () => {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      const saved = loadSavedOptions();
      populateDiceFormFrom(saved);
      applyActiveTabState();

      // --- House rules persistence (moved from inline index.html script) ---
      const HR_KEY_ENABLED = "houseRules.requireFirstRun";
      const HR_KEY_MIN = "houseRules.firstRunMin";
      const elEnableHR = document.getElementById("hr_enable_first_run");
      const elMinHR = document.getElementById("hr_first_run_min");
      const btnSaveHR = document.getElementById("save-house-rules");
      const btnResetHR = document.getElementById("reset-house-rules");

      function loadHouseRules() {
        try {
          const enabled = localStorage.getItem(HR_KEY_ENABLED);
          const min = localStorage.getItem(HR_KEY_MIN);
          // default OFF when not previously set
          if (elEnableHR) elEnableHR.checked = enabled === null ? false : (enabled === "true");
          if (elMinHR) elMinHR.value = min === null ? 500 : Number(min) || 500;
        } catch (e) { /* ignore storage errors */ }
      }

      function saveHouseRules() {
        if (!elEnableHR || !elMinHR) return;
        try {
          localStorage.setItem(HR_KEY_ENABLED, elEnableHR.checked ? "true" : "false");
          localStorage.setItem(HR_KEY_MIN, String(Math.max(0, Math.floor(Number(elMinHR.value) || 0))));
          console.info("House rules saved");
        } catch (e) { console.warn("Failed to save house rules", e); }
      }

      function resetHouseDefaults() {
        if (!elEnableHR || !elMinHR) return;
        elEnableHR.checked = false; // default OFF
        elMinHR.value = 500;
        saveHouseRules();
      }

      // Initialize values on page load
      loadHouseRules();

      // Ensure modal open refresh also loads house rules (in case others changed localStorage)
      if (optionsBtn && modal) {
        optionsBtn.addEventListener('click', () => {
          loadHouseRules();
        });
      }

      if (btnSaveHR) btnSaveHR.addEventListener('click', saveHouseRules);
      if (btnResetHR) btnResetHR.addEventListener('click', resetHouseDefaults);

      const focusTarget = modal.querySelector('#save-dice-scores') || modal.querySelector('button');
      if (focusTarget) focusTarget.focus();
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? "true" : "false");
      });

      const target = btn.dataset.tab;
      panels.forEach(p => {
        const pid = p.id || "";
        const match = pid === target || pid === `${target}-panel`;
        p.hidden = !match;
      });
    });
  });

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // wire close buttons & backdrop correctly (fix missing listeners)
  const closeOptionsTop = document.getElementById('close-options');
  if (closeOptionsTop) closeOptionsTop.addEventListener('click', closeModal);
  if (closeOptionsBottom) closeOptionsBottom.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Save dice scores handler – ONLY mark useCustom if values differ from defaults
  if (saveDiceBtn) {
    saveDiceBtn.addEventListener('click', () => {
      const vals = readDiceFormValues();
      if (!vals) return;

      let changed = false;
      for (const k of Object.keys(DEFAULT_DICE_SCORES)) {
        if ((vals[k] ?? DEFAULT_DICE_SCORES[k]) !== DEFAULT_DICE_SCORES[k]) {
          changed = true;
          break;
        }
      }

      try {
        if (changed) {
          saveOptions({ diceScores: vals, useCustom: true, savedAt: Date.now() });
        } else {
          // exactly defaults -> remove any custom flag
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}

      closeModal();
    });
  }

  // Reset → force defaults and clear any saved custom options
  if (resetDiceBtn) {
    resetDiceBtn.addEventListener('click', () => {
      populateDiceFormFrom({ diceScores: DEFAULT_DICE_SCORES });
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    });
  }

  // Start button: ONLY launch custom if options actually differ from defaults
  if (startBtn && playerInput) {
    startBtn.addEventListener('click', () => {
      let n = parseInt(playerInput.value, 10);
      if (!Number.isFinite(n) || n < 1) n = 1;
      if (n > 6) n = 6;
      playerInput.value = n;

      const vals = readDiceFormValues();
      if (!vals) return;

      // Determine if dice scores differ from defaults
      let diceChanged = false;
      for (const k of Object.keys(DEFAULT_DICE_SCORES)) {
        if ((vals[k] ?? DEFAULT_DICE_SCORES[k]) !== DEFAULT_DICE_SCORES[k]) {
          diceChanged = true;
          break;
        }
      }

      // Determine if house rules differ from defaults (default: disabled, min = 500)
      const HR_KEY_ENABLED = "houseRules.requireFirstRun";
      const HR_KEY_MIN = "houseRules.firstRunMin";
      const hrEnabled = localStorage.getItem(HR_KEY_ENABLED) === "true";
      const hrMin = Number(localStorage.getItem(HR_KEY_MIN) ?? 500) || 500;
      const houseChanged = hrEnabled || (hrMin !== 500);

      const customMode = diceChanged || houseChanged;

      const opts = {
        diceScores: vals,
        useCustom: customMode,
        savedAt: Date.now(),
        // include explicit house-rule fields when enabled so the game can read them
        ...(hrEnabled ? { requireFirstRun: true, firstRunMin: Math.max(0, Math.floor(hrMin)) } : {})
      };

      // Persist or clear options depending on whether custom mode is required
      try {
        if (customMode) {
          saveOptions(opts);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) { /* ignore */ }

      // Close modal BEFORE navigation
      closeModal();

      // Choose target page: prefer game.html for "normal" mode, gameCustom.html for custom.
      // If game.html is not present, fall back to gameCustom.html.
      const customUrl = "gameCustom.html";
      const normalUrl = "game.html";

      if (customMode) {
        window.location.href = customUrl;
        return;
      }

      // Try to verify normalUrl exists, otherwise fallback
      fetch(normalUrl, { method: "HEAD" }).then(res => {
        if (res.ok) {
          window.location.href = normalUrl;
        } else {
          window.location.href = customUrl;
        }
      }).catch(() => {
        window.location.href = customUrl;
      });
    });
  }
});