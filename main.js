(() => {
  const LS_KEY = "weights_minimal_v4";
  const LEGACY_LS_KEYS = ["weights_minimal_v3"];

  let state = {
    workouts: [],
    screen: "main",
    mainAddOpen: false,
    mainExpandedWorkoutId: null,
    fontSizePt: 10,
    themeKey: "parchment",
    historyOpen: false,
    historyMaxFocus: null,
    historyFilterOpen: false,
    historyFilterWeight: "",
    historyFilterReps: "",
    expandedWorkoutId: null,
    expandedExerciseId: null,
    exerciseLookup: [],
    current: null,
    edit: null
  };

  const elList = document.getElementById("list");
  const elImportInput = document.getElementById("csvImportInput");
  const elImportStatus = document.getElementById("importStatus");
  const elSettingsBtn = document.getElementById("settingsBtn");
  const elTitleText = document.querySelector(".titleText");
  const elAddWorkoutBtn = document.getElementById("addWorkoutBtn");
  const elBackBtn = document.getElementById("backBtn");
  const elTitleMenu = document.getElementById("titleMenu");
  const elMainAddHost = document.getElementById("mainAddHost");
  const elImportCsvBtn = document.getElementById("importCsvBtn");
  const elExportCsvBtn = document.getElementById("exportCsvBtn");
  const elFontSizeSlider = document.getElementById("fontSizeSlider");
  const elFontSizeValue = document.getElementById("fontSizeValue");
  const elThemeOptions = document.getElementById("themeOptions");
  const elDeleteAllBtn = document.getElementById("deleteAllBtn");
  const elDeleteConfirmRow = document.getElementById("deleteConfirmRow");
  const elDeleteConfirmOkBtn = document.getElementById("deleteConfirmOkBtn");
  const elDeleteConfirmCancelBtn = document.getElementById("deleteConfirmCancelBtn");
  const elHistoryDrawer = document.getElementById("historyDrawer");
  const elHistoryTab = document.getElementById("historyTab");
  const elHistoryChevron = document.getElementById("historyChevron");
  const elHistoryList = document.getElementById("historyList");
  const elHistoryMeta = document.getElementById("historyMeta");
  const elHistoryFilterBtn = document.getElementById("historyFilterBtn");
  const elHistoryFilterIcon = document.getElementById("historyFilterIcon");
  const elHistoryFilterBar = document.getElementById("historyFilterBar");
  const elHistoryWeightFilterInput = document.getElementById("historyWeightFilterInput");
  const elHistoryRepsFilterInput = document.getElementById("historyRepsFilterInput");

  let importStatusTimer = null;
  let settingsMenuOpen = false;
  let deleteAllConfirmOpen = false;
  const HISTORY_CHEVRON_UP = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m18 15-6-6-6 6"></path>
    </svg>
  `;
  const HISTORY_CHEVRON_DOWN = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6"></path>
    </svg>
  `;
  const HISTORY_FILTER_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path>
    </svg>
  `;
  const FONT_PT_MIN = 10;
  const FONT_PT_MAX = 24;
  const DEFAULT_THEME_KEY = "parchment";
  const THEME_KEY_ALIASES = {
    sage: "sky",
    clay: "citrus",
    orange: "citrus",
    blue: "sky"
  };
  const THEME_PRESETS = {
    parchment: {
      label: "Parchment",
      vars: {
        "--bg": "#f2efe9",
        "--surface": "#f9f7f2",
        "--surface2": "#f1ece4",
        "--ink": "#1a1815",
        "--muted": "#6c655c",
        "--line": "#d2cbc0",
        "--line2": "#e5dfd4",
        "--bar": "#ece7de",
        "--accent": "#c55a2a",
        "--accent-soft": "#f4e2d8",
        "--focus": "#c55a2a"
      }
    },
    mist: {
      label: "Mist",
      vars: {
        "--bg": "#f4f5f4",
        "--surface": "#fafbfa",
        "--surface2": "#f0f2f0",
        "--ink": "#1d2121",
        "--muted": "#676e6d",
        "--line": "#cfd5d4",
        "--line2": "#dfe4e3",
        "--bar": "#e8eceb",
        "--accent": "#b8643a",
        "--accent-soft": "#f1e2d7",
        "--focus": "#b8643a"
      }
    },
    citrus: {
      label: "Citrus",
      vars: {
        "--bg": "#f5e6d8",
        "--surface": "#fbf1e8",
        "--surface2": "#f2e3d5",
        "--ink": "#2a1b11",
        "--muted": "#7a5e4d",
        "--line": "#d8c0ad",
        "--line2": "#e8d5c6",
        "--bar": "#eddcca",
        "--accent": "#d86a2f",
        "--accent-soft": "#f6dfcd",
        "--focus": "#d86a2f"
      }
    },
    sky: {
      label: "Sky",
      vars: {
        "--bg": "#e5edf6",
        "--surface": "#f1f6fc",
        "--surface2": "#e0eaf5",
        "--ink": "#132033",
        "--muted": "#5f6f84",
        "--line": "#bccadc",
        "--line2": "#d3deeb",
        "--bar": "#d8e4f1",
        "--accent": "#2f6fb2",
        "--accent-soft": "#d8e7f8",
        "--focus": "#2f6fb2"
      }
    },
    midnight: {
      label: "Midnight",
      vars: {
        "--bg": "#121822",
        "--surface": "#1a2230",
        "--surface2": "#242f40",
        "--ink": "#e8edf5",
        "--muted": "#adb7c7",
        "--line": "#34455d",
        "--line2": "#2b3a50",
        "--bar": "#1e2938",
        "--accent": "#d78a5f",
        "--accent-soft": "#2b384a",
        "--focus": "#d78a5f"
      }
    }
  };

  // ---------- Utilities ----------
  const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
  function normalizeThemeKey(rawThemeKey) {
    const t = String(rawThemeKey || "").trim().toLowerCase();
    const mapped = THEME_KEY_ALIASES[t] || t;
    return THEME_PRESETS[mapped] ? mapped : DEFAULT_THEME_KEY;
  }
  function clampFontPt(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return FONT_PT_MIN;
    return Math.max(FONT_PT_MIN, Math.min(FONT_PT_MAX, Math.round(n)));
  }
  function getThemePreset(themeKey) {
    return THEME_PRESETS[themeKey] || THEME_PRESETS[DEFAULT_THEME_KEY];
  }
  function applyFontSize() {
    const pt = clampFontPt(state.fontSizePt);
    state.fontSizePt = pt;
    const scale = pt / FONT_PT_MIN;
    document.documentElement.style.setProperty("--font-scale", String(scale));
    document.documentElement.style.setProperty("--font-size-pt", `${pt}pt`);
    if (elFontSizeSlider && String(elFontSizeSlider.value) !== String(pt)) {
      elFontSizeSlider.value = String(pt);
    }
    if (elFontSizeValue) elFontSizeValue.textContent = `${pt}pt`;
  }
  function updateThemeButtons() {
    if (!elThemeOptions) return;
    const buttons = elThemeOptions.querySelectorAll(".themeOption");
    buttons.forEach((btn) => {
      const key = btn.getAttribute("data-theme-key");
      const isActive = key === state.themeKey;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-checked", isActive ? "true" : "false");
    });
  }
  function applyTheme() {
    state.themeKey = normalizeThemeKey(state.themeKey);
    const preset = getThemePreset(state.themeKey);
    for (const [name, value] of Object.entries(preset.vars)) {
      document.documentElement.style.setProperty(name, value);
    }
    if (document.body) document.body.dataset.theme = state.themeKey;
    const metaTheme = document.querySelector("meta[name=\"theme-color\"]");
    if (metaTheme) metaTheme.setAttribute("content", preset.vars["--bar"] || "#ece7de");
    updateThemeButtons();
  }
  function buildThemeOptions() {
    if (!elThemeOptions) return;
    elThemeOptions.innerHTML = "";
    for (const [key, preset] of Object.entries(THEME_PRESETS)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "themeOption";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-label", preset.label);
      btn.setAttribute("title", preset.label);
      btn.dataset.themeKey = key;
      btn.style.setProperty("--theme-bg", preset.vars["--bg"]);
      btn.style.setProperty("--theme-ink", preset.vars["--ink"]);
      btn.style.setProperty("--theme-line", preset.vars["--line"]);
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        state.themeKey = key;
        applyTheme();
        save();
      });
      elThemeOptions.appendChild(btn);
    }
    updateThemeButtons();
  }
  function applyAppearance() {
    applyTheme();
    applyFontSize();
  }

  function normalizeUnitToken(tok) {
    const t = String(tok || "").trim().toLowerCase();
    if (t === "kg" || t === "k") return "kg";
    return "lb";
  }
  function normalizeLoadLabelToken(raw) {
    const t = String(raw || "").trim().toLowerCase();
    if (!t) return null;
    if (t === "bw" || t === "bodyweight") return null;
    if (!/^[a-z][a-z0-9_-]{0,23}$/.test(t)) return null;
    return t;
  }
  function normalizeLoadExprToken(raw) {
    const t = String(raw || "").trim().toLowerCase().replace(/\s+/g, "");
    if (!t) return null;
    if (!/^[0-9./+a-z]+$/.test(t)) return null;
    return t;
  }
  function parseLoadToken(raw) {
    const t = String(raw || "").trim().toLowerCase();
    if (!t) return { weight:null, unit:"lb", loadLabel:null, loadExpr:null };
    if (t === "bw" || t === "bodyweight") return { weight:null, unit:"lb", loadLabel:null, loadExpr:null };

    // Composite dumbbell / dual-load notation like "22.5/22.5" or "32+32kg".
    const hasSlash = t.includes("/");
    const hasPlus = t.includes("+");
    if (hasSlash || hasPlus) {
      if (hasSlash && hasPlus) return null;
      const op = hasSlash ? "/" : "+";
      const parts = t.split(op).map(part => part.trim()).filter(Boolean);
      if (parts.length >= 2) {
        let explicitUnit = null;
        const values = [];
        let ok = true;

        for (const part of parts) {
          const mPart = part.match(/^(\d+(\.\d+)?)([a-zA-Z]{0,3})$/);
          if (!mPart) { ok = false; break; }
          values.push(Number(mPart[1]));
          const unitToken = String(mPart[3] || "");
          if (unitToken) {
            const unit = normalizeUnitToken(unitToken);
            if (explicitUnit && explicitUnit !== unit) { ok = false; break; }
            explicitUnit = unit;
          }
        }

        if (ok) {
          const unit = explicitUnit || "lb";
          const baseExpr = values.map(trimNum).join(op);
          const loadExpr = unit === "kg" ? `${baseExpr}kg` : baseExpr;
          return { weight:null, unit, loadLabel:null, loadExpr };
        }
      }
    }

    const m = t.match(/^(\d+(\.\d+)?)([a-zA-Z]{0,3})$/);
    if (m) {
      return {
        weight: Number(m[1]),
        unit: normalizeUnitToken(m[3] || "lb"),
        loadLabel: null,
        loadExpr: null
      };
    }

    const loadLabel = normalizeLoadLabelToken(t);
    if (!loadLabel) return null;
    return { weight:null, unit:"lb", loadLabel, loadExpr:null };
  }
  function formatSetLoadSuffix(set, spaced = false) {
    if (!set || typeof set !== "object") return "";
    const sep = spaced ? " @ " : "@";

    if (set.weight != null) {
      return `${sep}${trimNum(set.weight)}${set.unit === "kg" ? "kg" : ""}`;
    }
    const loadExpr = normalizeLoadExprToken(set.loadExpr || "");
    if (loadExpr) return `${sep}${loadExpr}`;
    const loadLabel = normalizeLoadLabelToken(set.loadLabel || "");
    if (loadLabel) return `${sep}${loadLabel}`;
    return "";
  }
  function trimNum(x) {
    const s = String(x);
    if (s.includes(".")) return s.replace(/\.0+$/,"").replace(/(\.\d*?)0+$/,"$1");
    return s;
  }
  function makeInvalidSet(raw) {
    const t = String(raw || "").trim();
    return { invalid:true, raw:t || "?" };
  }
  function normalizeMetricToken(raw) {
    const t = String(raw || "").trim().toLowerCase();
    if (t === "s" || t === "sec" || t === "secs" || t === "second" || t === "seconds") return "seconds";
    if (t === "m" || t === "meter" || t === "meters") return "meters";
    if (t === "ft" || t === "foot" || t === "feet") return "feet";
    return "reps";
  }
  function buildSet(metric, value, weight = null, unit = "lb", loadLabel = null, extras = null) {
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) return null;

    let w = null;
    let label = normalizeLoadLabelToken(loadLabel || "");
    let expr = normalizeLoadExprToken(extras && extras.loadExpr ? extras.loadExpr : "");
    if (weight != null && weight !== "") {
      const parsedWeight = Number(weight);
      if (Number.isFinite(parsedWeight) && parsedWeight >= 0) {
        w = parsedWeight;
        label = null;
        expr = null;
      } else if (!label) {
        label = normalizeLoadLabelToken(weight);
      }
    }

    const out = { weight: w, unit: normalizeUnitToken(unit || "lb") };
    if (expr) out.loadExpr = expr;
    else if (label) out.loadLabel = label;
    const secondaryRaw = Number(
      extras && extras.secondary != null
        ? extras.secondary
        : extras && extras.repsSecondary != null
          ? extras.repsSecondary
          : NaN
    );
    const hasSecondary = Number.isFinite(secondaryRaw) && secondaryRaw > 0;

    if (metric === "seconds") {
      out.seconds = v;
      if (hasSecondary) out.secondsSecondary = secondaryRaw;
    } else if (metric === "meters") {
      out.meters = v;
      if (hasSecondary) out.metersSecondary = secondaryRaw;
    } else if (metric === "feet") {
      out.feet = v;
      if (hasSecondary) out.feetSecondary = secondaryRaw;
    } else {
      out.reps = Math.floor(v);
      if (Number.isInteger(secondaryRaw) && secondaryRaw > 0) {
        out.repsSecondary = secondaryRaw;
      }
    }
    if (w == null && !out.loadExpr && !out.loadLabel) {
      const fallbackExpr = normalizeLoadExprToken(weight);
      if (fallbackExpr) out.loadExpr = fallbackExpr;
    }
    return out;
  }
  function parseSetValueToken(metric, rawValueToken) {
    const token = String(rawValueToken || "").trim();
    if (!token) return null;

    if (metric !== "reps") {
      const m = token.match(/^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/);
      if (!m) return null;
      const primary = Number(m[1]);
      const secondary = m[2] != null ? Number(m[2]) : null;
      if (!Number.isFinite(primary) || primary <= 0) return null;
      if (secondary != null && (!Number.isFinite(secondary) || secondary <= 0)) return null;
      return { value:primary, repsSecondary:secondary };
    }

    const m = token.match(/^(\d+)(?:\/(\d+))?$/);
    if (!m) return null;
    const primary = Number(m[1]);
    const secondary = m[2] != null ? Number(m[2]) : null;
    if (!Number.isInteger(primary) || primary <= 0) return null;
    if (secondary != null && (!Number.isInteger(secondary) || secondary <= 0)) return null;
    return { value:primary, repsSecondary:secondary };
  }
  function getSetMetric(set) {
    if (!set || typeof set !== "object") return null;
    if (set.invalid) return { metric:"invalid", value:null };

    const reps = Number(set.reps);
    if (Number.isFinite(reps) && reps > 0) {
      const primary = Math.floor(reps);
      const secondaryRaw = Number(set.repsSecondary);
      const hasSecondary = Number.isInteger(secondaryRaw) && secondaryRaw > 0;
      return {
        metric:"reps",
        value: primary,
        secondary: hasSecondary ? secondaryRaw : null,
        display: hasSecondary ? `${primary}/${secondaryRaw}` : `${primary}`
      };
    }

    const seconds = Number(set.seconds);
    if (Number.isFinite(seconds) && seconds > 0) {
      const secondaryRaw = Number(set.secondsSecondary);
      const hasSecondary = Number.isFinite(secondaryRaw) && secondaryRaw > 0;
      return {
        metric:"seconds",
        value: seconds,
        secondary: hasSecondary ? secondaryRaw : null,
        display: hasSecondary ? `${trimNum(seconds)}/${trimNum(secondaryRaw)}` : `${trimNum(seconds)}`
      };
    }

    const meters = Number(set.meters);
    if (Number.isFinite(meters) && meters > 0) {
      const secondaryRaw = Number(set.metersSecondary);
      const hasSecondary = Number.isFinite(secondaryRaw) && secondaryRaw > 0;
      return {
        metric:"meters",
        value: meters,
        secondary: hasSecondary ? secondaryRaw : null,
        display: hasSecondary ? `${trimNum(meters)}/${trimNum(secondaryRaw)}` : `${trimNum(meters)}`
      };
    }

    const feet = Number(set.feet);
    if (Number.isFinite(feet) && feet > 0) {
      const secondaryRaw = Number(set.feetSecondary);
      const hasSecondary = Number.isFinite(secondaryRaw) && secondaryRaw > 0;
      return {
        metric:"feet",
        value: feet,
        secondary: hasSecondary ? secondaryRaw : null,
        display: hasSecondary ? `${trimNum(feet)}/${trimNum(secondaryRaw)}` : `${trimNum(feet)}`
      };
    }

    return null;
  }
  function normalizeStoredSet(rawSet) {
    if (!rawSet || typeof rawSet !== "object") return null;

    if (rawSet.invalid || rawSet.kind === "invalid") {
      const raw = String(rawSet.raw || "").trim();
      return raw ? { invalid:true, raw } : null;
    }

    const reps = Number(rawSet.reps);
    if (Number.isFinite(reps) && reps > 0) {
      return buildSet(
        "reps",
        Math.floor(reps),
        rawSet.weight,
        rawSet.unit || "lb",
        rawSet.loadLabel || null,
        {
          secondary: rawSet.repsSecondary,
          loadExpr: rawSet.loadExpr || null
        }
      );
    }

    const seconds = Number(rawSet.seconds);
    if (Number.isFinite(seconds) && seconds > 0) {
      return buildSet("seconds", seconds, rawSet.weight, rawSet.unit || "lb", rawSet.loadLabel || null, {
        secondary: rawSet.secondsSecondary,
        loadExpr: rawSet.loadExpr || null
      });
    }

    const meters = Number(rawSet.meters);
    if (Number.isFinite(meters) && meters > 0) {
      return buildSet("meters", meters, rawSet.weight, rawSet.unit || "lb", rawSet.loadLabel || null, {
        secondary: rawSet.metersSecondary,
        loadExpr: rawSet.loadExpr || null
      });
    }

    const feet = Number(rawSet.feet);
    if (Number.isFinite(feet) && feet > 0) {
      return buildSet("feet", feet, rawSet.weight, rawSet.unit || "lb", rawSet.loadLabel || null, {
        secondary: rawSet.feetSecondary,
        loadExpr: rawSet.loadExpr || null
      });
    }

    return null;
  }
  function isDeleteToken(raw) {
    const t = String(raw || "").trim().toLowerCase();
    return t === "x" || t === "del" || t === "delete";
  }
  function isValidDateParts(y, mo, d) {
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
    const dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && (dt.getMonth() + 1) === mo && dt.getDate() === d;
  }
  function formatISOFromParts(y, mo, d) {
    return `${String(y).padStart(4,"0")}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }
  function todayISO(offsetDays = 0) {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    if (offsetDays) dt.setDate(dt.getDate() + offsetDays);
    return formatISOFromParts(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
  }
  function parseDateToken(token) {
    const t = String(token || "").trim().toLowerCase();
    if (!t) return null;
    if (t === "t" || t === "today") return todayISO(0);
    if (t === "y" || t === "yday" || t === "yesterday") return todayISO(-1);
    if (t === "tmr" || t === "tomorrow") return todayISO(1);

    const m4 = t.match(/^(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})$/);
    if (m4) {
      const y = +m4[1], mo = +m4[2], d = +m4[3];
      if (!isValidDateParts(y, mo, d)) return null;
      return formatISOFromParts(y, mo, d);
    }
    const m2 = t.match(/^(\d{2})[.\-\/](\d{1,2})[.\-\/](\d{1,2})$/);
    if (m2) {
      const y = 2000 + (+m2[1]), mo = +m2[2], d = +m2[3];
      if (!isValidDateParts(y, mo, d)) return null;
      return formatISOFromParts(y, mo, d);
    }
    return null;
  }
  function sanitizeState() {
    const cleanWorkouts = [];

    for (const rawW of state.workouts) {
      if (!rawW || typeof rawW !== "object") continue;
      const dateISO = parseDateToken(rawW.dateISO);
      if (!dateISO) continue;

      const exercises = [];
      const rawExercises = Array.isArray(rawW.exercises) ? rawW.exercises : [];

      for (const rawEx of rawExercises) {
        if (!rawEx || typeof rawEx !== "object") continue;
        const name = String(rawEx.name || "").trim();
        if (!name) continue;

        const sets = [];
        const rawSets = Array.isArray(rawEx.sets) ? rawEx.sets : [];
        for (const rawSet of rawSets) {
          const normalized = normalizeStoredSet(rawSet);
          if (!normalized) continue;
          sets.push(normalized);
        }

        exercises.push({
          id: String(rawEx.id || uid()),
          name,
          sets
        });
      }

      cleanWorkouts.push({
        id: String(rawW.id || uid()),
        dateISO,
        exercises
      });
    }

    state.workouts = cleanWorkouts;
    state.mainExpandedWorkoutId = state.workouts.some(w => w.id === state.mainExpandedWorkoutId)
      ? state.mainExpandedWorkoutId
      : null;
    state.expandedWorkoutId = state.workouts.some(w => w.id === state.expandedWorkoutId) ? state.expandedWorkoutId : null;
    if (!state.expandedWorkoutId) state.expandedExerciseId = null;

    if (state.expandedWorkoutId) {
      const expandedWorkout = state.workouts.find(w => w.id === state.expandedWorkoutId);
      state.expandedExerciseId = expandedWorkout && expandedWorkout.exercises.some(ex => ex.id === state.expandedExerciseId)
        ? state.expandedExerciseId
        : null;
    }

    if (state.screen !== "workout") {
      state.screen = "main";
      state.mainAddOpen = !!state.mainAddOpen;
      state.historyOpen = false;
      state.historyFilterOpen = false;
      state.historyFilterWeight = "";
      state.historyFilterReps = "";
      state.expandedWorkoutId = null;
      state.expandedExerciseId = null;
    } else {
      state.mainAddOpen = false;
      state.historyOpen = !!state.historyOpen;
      state.historyFilterOpen = !!state.historyFilterOpen;
      state.historyFilterWeight = String(state.historyFilterWeight || "");
      state.historyFilterReps = String(state.historyFilterReps || "");
      if (!state.expandedWorkoutId) {
        state.screen = "main";
        state.historyOpen = false;
        state.historyFilterOpen = false;
        state.historyFilterWeight = "";
        state.historyFilterReps = "";
        state.expandedExerciseId = null;
      }
    }
    state.fontSizePt = clampFontPt(state.fontSizePt);
    state.themeKey = normalizeThemeKey(state.themeKey);

    rebuildExerciseLookup();
    sanitizeCurrent();
  }
  function sanitizeCurrent() {
    const cur = state.current;
    if (!cur || typeof cur !== "object") {
      state.current = null;
      return;
    }

    const workoutId = String(cur.workoutId || "");
    if (!workoutId) {
      state.current = null;
      return;
    }

    const workout = state.workouts.find(item => item.id === workoutId);
    if (!workout) {
      state.current = null;
      return;
    }

    if (cur.kind === "workout") {
      state.current = { kind:"workout", workoutId: workout.id };
      return;
    }

    const exerciseId = String(cur.exerciseId || "");
    const exercise = workout.exercises.find(item => item.id === exerciseId);
    if (!exercise) {
      state.current = { kind:"workout", workoutId: workout.id };
      return;
    }

    if (cur.kind === "exercise") {
      state.current = { kind:"exercise", workoutId: workout.id, exerciseId: exercise.id };
      return;
    }

    if (cur.kind === "set") {
      const setIndex = Number(cur.setIndex);
      if (!Number.isInteger(setIndex) || setIndex < 0 || setIndex >= exercise.sets.length) {
        state.current = { kind:"exercise", workoutId: workout.id, exerciseId: exercise.id };
        return;
      }
      state.current = { kind:"set", workoutId: workout.id, exerciseId: exercise.id, setIndex };
      return;
    }

    state.current = null;
  }
  function coerceCurrentToVisible() {
    if (!state.current) return;

    if (state.screen !== "workout") {
      if (state.current.kind === "set" || state.current.kind === "exercise") {
        state.current = { kind:"workout", workoutId: state.current.workoutId };
      }
      return;
    }

    if (state.current.kind === "exercise" && state.expandedWorkoutId !== state.current.workoutId) {
      state.current = { kind:"workout", workoutId: state.current.workoutId };
      return;
    }
    if (state.current.kind === "exercise" && state.expandedExerciseId !== state.current.exerciseId) {
      state.current = { kind:"workout", workoutId: state.current.workoutId };
      return;
    }
    if (state.current.kind === "set") {
      if (state.expandedWorkoutId !== state.current.workoutId) {
        state.current = { kind:"workout", workoutId: state.current.workoutId };
        return;
      }
      if (state.expandedExerciseId !== state.current.exerciseId) {
        state.current = { kind:"workout", workoutId: state.current.workoutId };
        return;
      }
    }
  }

  function save() {
    rebuildExerciseLookup();
    localStorage.setItem(LS_KEY, JSON.stringify({
      workouts: state.workouts,
      screen: state.screen,
      mainAddOpen: state.mainAddOpen,
      mainExpandedWorkoutId: state.mainExpandedWorkoutId,
      fontSizePt: state.fontSizePt,
      themeKey: state.themeKey,
      historyOpen: state.historyOpen,
      expandedWorkoutId: state.expandedWorkoutId,
      expandedExerciseId: state.expandedExerciseId,
      current: state.current
    }));
  }
  function load() {
    const keys = [LS_KEY, ...LEGACY_LS_KEYS];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.workouts)) continue;

        state.workouts = parsed.workouts;
        state.screen = parsed.screen === "workout" ? "workout" : "main";
        state.mainAddOpen = !!parsed.mainAddOpen;
        state.mainExpandedWorkoutId = parsed.mainExpandedWorkoutId ?? null;
        state.fontSizePt = parsed.fontSizePt ?? state.fontSizePt;
        state.themeKey = normalizeThemeKey(parsed.themeKey ?? state.themeKey);
        state.historyOpen = !!parsed.historyOpen;
        state.expandedWorkoutId = parsed.expandedWorkoutId ?? null;
        state.expandedExerciseId = parsed.expandedExerciseId ?? null;
        state.current = parsed.current ?? null;
        sanitizeState();

        // Migrate legacy versions forward on first open.
        if (key !== LS_KEY) save();
        return true;
      } catch {}
    }
    return false;
  }

  function sortWorkoutsAsc() {
    state.workouts.sort((a,b) => a.dateISO.localeCompare(b.dateISO));
  }

  function parseDatePrefix(s) {
    const m = s.trim().match(/^(\S+)\s*(.*)$/);
    if (!m) return null;
    const dateISO = parseDateToken(m[1]);
    if (!dateISO) return null;
    return { dateISO, rest: (m[2] ?? "").trim() };
  }
  function dowShort(dateISO) {
    const [y,m,d] = dateISO.split("-").map(Number);
    const dt = new Date(y, m-1, d);
    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()];
  }
  function fmtDateDisplay(dateISO) {
    const [y,m,d] = dateISO.split("-");
    return `${y}.${m}.${d}`;
  }
  function normalizeExerciseName(raw) {
    return String(raw || "").trim().replace(/\s+/g, " ");
  }
  function cleanSetsSpec(raw) {
    let s = String(raw || "").trim();
    if (!s) return "";
    s = s.replace(/\([^)]*\)/g, " ");
    s = s.split(/\s+-\s+/)[0];
    return s.replace(/\s+/g, " ").trim();
  }
  function setDeleteAllConfirmOpen(open) {
    deleteAllConfirmOpen = !!open;
    if (elDeleteConfirmRow) elDeleteConfirmRow.classList.toggle("show", deleteAllConfirmOpen);
  }
  function setSettingsMenuOpen(open) {
    settingsMenuOpen = !!open;
    if (elTitleMenu) elTitleMenu.classList.toggle("show", settingsMenuOpen);
    if (elSettingsBtn) elSettingsBtn.classList.toggle("open", settingsMenuOpen);
    if (!settingsMenuOpen) setDeleteAllConfirmOpen(false);
  }
  function setScreenMain() {
    state.screen = "main";
    state.mainAddOpen = false;
    state.historyOpen = false;
    state.historyMaxFocus = null;
    state.historyFilterOpen = false;
    state.historyFilterWeight = "";
    state.historyFilterReps = "";
    state.expandedWorkoutId = null;
    state.expandedExerciseId = null;
    state.edit = null;
    setSettingsMenuOpen(false);
  }
  function openWorkoutScreen(workoutId) {
    const workout = findWorkout(workoutId);
    if (!workout) return false;

    state.screen = "workout";
    state.mainAddOpen = false;
    state.historyOpen = false;
    state.historyMaxFocus = null;
    state.historyFilterOpen = false;
    state.historyFilterWeight = "";
    state.historyFilterReps = "";
    state.mainExpandedWorkoutId = workout.id;
    state.expandedWorkoutId = workout.id;
    state.expandedExerciseId = null;
    setCurrentWorkout(workout.id);
    setSettingsMenuOpen(false);
    return true;
  }
  function updateTitleBar(activeWorkout) {
    const isMain = state.screen !== "workout";
    if (elTitleText) {
      elTitleText.textContent = isMain ? "Weights" : (activeWorkout ? fmtDateDisplay(activeWorkout.dateISO) : "Workout");
    }
    if (elSettingsBtn) elSettingsBtn.classList.toggle("hidden", !isMain);
    if (elAddWorkoutBtn) elAddWorkoutBtn.classList.toggle("hidden", !isMain);
    if (elBackBtn) elBackBtn.classList.toggle("hidden", isMain);
    if (!isMain) setSettingsMenuOpen(false);
  }
  function showImportStatus(message, isError = false) {
    if (!elImportStatus) return;

    if (importStatusTimer) {
      clearTimeout(importStatusTimer);
      importStatusTimer = null;
    }

    const text = String(message || "").trim();
    if (!text) {
      elImportStatus.textContent = "";
      elImportStatus.classList.remove("show", "error");
      return;
    }

    elImportStatus.textContent = text;
    elImportStatus.classList.add("show");
    elImportStatus.classList.toggle("error", !!isError);
    importStatusTimer = setTimeout(() => {
      elImportStatus.textContent = "";
      elImportStatus.classList.remove("show", "error");
      importStatusTimer = null;
    }, isError ? 5200 : 3600);
  }
  function registerPwaServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    const isSecureOrigin = location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";
    if (!isSecureOrigin) return;
    let swRefreshPending = false;
    let swRefreshStarted = false;

    const requestRefresh = () => {
      swRefreshPending = true;
      if (document.visibilityState !== "visible") return;
      if (swRefreshStarted) return;
      swRefreshStarted = true;
      window.location.reload();
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && swRefreshPending) {
        requestRefresh();
      }
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      requestRefresh();
    });

    navigator.serviceWorker.register("./sw.js").then((registration) => {
      const nudgeUpdate = () => {
        registration.update().catch(() => {});
      };
      const activateWaitingWorker = () => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type:"SKIP_WAITING" });
        }
      };

      activateWaitingWorker();
      nudgeUpdate();

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            activateWaitingWorker();
          }
        });
      });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") nudgeUpdate();
      });
    }).catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  }
  function parseCsvRows(text) {
    const src = String(text || "").replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < src.length; i++) {
      const ch = src[i];

      if (inQuotes) {
        if (ch === "\"") {
          if (src[i + 1] === "\"") {
            field += "\"";
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === "\"") {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (ch === "\r") {
        continue;
      } else {
        field += ch;
      }
    }

    row.push(field);
    if (row.length > 1 || row[0].trim() !== "") rows.push(row);
    return rows;
  }
  function csvEscapeField(value) {
    const s = String(value ?? "");
    if (!/[",\r\n]/.test(s)) return s;
    return `"${s.replace(/"/g, "\"\"")}"`;
  }
  function buildExportCsvData() {
    const rows = [["date", "exercise", "sets/reps/weight"]];
    const workoutsAsc = [...state.workouts].sort((a, b) => a.dateISO.localeCompare(b.dateISO));

    for (const workout of workoutsAsc) {
      const date = fmtDateDisplay(workout.dateISO);
      const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
      for (const exercise of exercises) {
        const name = normalizeExerciseName(exercise.name);
        if (!name) continue;
        const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
        rows.push([date, name, summarizeSets(sets)]);
      }
    }

    return {
      rowCount: Math.max(0, rows.length - 1),
      text: rows.map((row) => row.map(csvEscapeField).join(",")).join("\n")
    };
  }
  function downloadCsv(text, filename) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function looksLikeCsvHeader(row) {
    if (!Array.isArray(row) || !row.length) return false;
    const c0 = String(row[0] || "").trim().toLowerCase();
    const c1 = String(row[1] || "").trim().toLowerCase();
    const c2 = String(row[2] || "").trim().toLowerCase();
    return c0 === "date" && c1 === "exercise" && (c2.includes("sets") || c2.includes("reps"));
  }
  function importCsvText(text) {
    const rows = parseCsvRows(text);
    if (!rows.length) {
      return {
        importedRows: 0,
        skippedRows: 0,
        createdWorkouts: 0,
        createdExercises: 0,
        importedSets: 0,
        focusWorkoutId: null
      };
    }

    const startIndex = looksLikeCsvHeader(rows[0]) ? 1 : 0;
    const workoutByDate = new Map(state.workouts.map(w => [w.dateISO, w]));

    let importedRows = 0;
    let skippedRows = 0;
    let createdWorkouts = 0;
    let createdExercises = 0;
    let importedSets = 0;
    let latestDateISO = null;

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      const dateISO = parseDateToken(row[0]);
      const exerciseName = normalizeExerciseName(row[1]);
      const setsSpec = cleanSetsSpec(row[2]);

      if (!dateISO || !exerciseName) {
        if (row.some(value => String(value || "").trim() !== "")) skippedRows += 1;
        continue;
      }

      const key = exerciseName.toLowerCase();
      const existingWorkout = workoutByDate.get(dateISO) || null;
      const existingExercise = existingWorkout
        ? existingWorkout.exercises.find(item => normalizeExerciseName(item.name).toLowerCase() === key) || null
        : null;

      let parsedSets = [];
      if (setsSpec) {
        const prev = existingExercise && existingExercise.sets.length
          ? existingExercise.sets[existingExercise.sets.length - 1]
          : null;
        parsedSets = parseSetsSpec(setsSpec, prev) || [];
        if (!parsedSets.length) {
          skippedRows += 1;
          continue;
        }
      }

      let workout = existingWorkout;
      if (!workout) {
        workout = { id: uid(), dateISO, exercises: [] };
        state.workouts.push(workout);
        workoutByDate.set(dateISO, workout);
        createdWorkouts += 1;
      }

      let exercise = existingExercise;
      if (!exercise) {
        exercise = { id: uid(), name: exerciseName, sets: [] };
        workout.exercises.push(exercise);
        createdExercises += 1;
      }

      if (parsedSets.length) {
        exercise.sets.push(...parsedSets);
        importedSets += parsedSets.length;
      }

      importedRows += 1;
      if (!latestDateISO || dateISO > latestDateISO) latestDateISO = dateISO;
    }

    sortWorkoutsAsc();
    rebuildExerciseLookup();
    sanitizeCurrent();

    let focusWorkoutId = null;
    if (latestDateISO) {
      const focusWorkout = workoutByDate.get(latestDateISO);
      if (focusWorkout) focusWorkoutId = focusWorkout.id;
    }

    return {
      importedRows,
      skippedRows,
      createdWorkouts,
      createdExercises,
      importedSets,
      focusWorkoutId
    };
  }
  async function handleCsvImportInputChange(ev) {
    const input = ev.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files && input.files[0];
    if (!file) return;
    setSettingsMenuOpen(false);

    try {
      const raw = await file.text();
      state.edit = null;
      const result = importCsvText(raw);
      if (state.screen === "main" && result.focusWorkoutId) {
        setCurrentWorkout(result.focusWorkoutId);
      }
      save();
      render(result.focusWorkoutId ? { scrollToWorkoutId: result.focusWorkoutId } : undefined);

      if (!result.importedRows) {
        showImportStatus(`Imported 0 rows (${result.skippedRows} skipped).`, true);
      } else {
        const skippedPart = result.skippedRows ? `, ${result.skippedRows} skipped` : "";
        showImportStatus(
          `Imported ${result.importedRows} rows, ${result.importedSets} sets${skippedPart}.`,
          false
        );
      }
    } catch (err) {
      console.error(err);
      showImportStatus("Import failed.", true);
    } finally {
      input.value = "";
    }
  }
  function rebuildExerciseLookup() {
    const byKey = new Map();

    for (const workout of state.workouts) {
      for (const exercise of workout.exercises) {
        const name = String(exercise.name || "").trim();
        if (!name) continue;
        const key = name.toLowerCase();
        const existing = byKey.get(key);
        if (existing) existing.count += 1;
        else byKey.set(key, { name, count: 1 });
      }
    }

    state.exerciseLookup = [...byKey.values()]
      .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name))
      .map(item => item.name);
  }

  function parseSingleSet(raw, previousSet = null) {
    const s = raw.trim();
    if (!s) return null;

    // Shorthand: "5@" (or "30s@") reuses previous set's weight/unit.
    const mCarry = s.match(/^([0-9]+(?:\.[0-9]+)?(?:\/[0-9]+(?:\.[0-9]+)?)?)\s*(s|m|ft)?\s*@\s*$/i);
    if (mCarry && previousSet && (previousSet.weight != null || normalizeLoadLabelToken(previousSet.loadLabel || "") || normalizeLoadExprToken(previousSet.loadExpr || ""))) {
      const carryMetric = getSetMetric(previousSet);
      const metric = mCarry[2]
        ? normalizeMetricToken(mCarry[2])
        : (carryMetric && carryMetric.metric !== "invalid" ? carryMetric.metric : "reps");
      const valueInfo = parseSetValueToken(metric, mCarry[1]);
      if (!valueInfo) return null;
      return buildSet(
        metric,
        valueInfo.value,
        previousSet.weight,
        previousSet.unit || "lb",
        normalizeLoadLabelToken(previousSet.loadLabel || ""),
        {
          repsSecondary: valueInfo.repsSecondary,
          loadExpr: previousSet.loadExpr || null
        }
      );
    }

    const mWeight = s.match(/^([0-9]+(?:\.[0-9]+)?(?:\/[0-9]+(?:\.[0-9]+)?)?)\s*(s|m|ft)?\s*[@x]\s*([^\s]+)\s*$/i);
    if (mWeight) {
      const metric = mWeight[2] ? normalizeMetricToken(mWeight[2]) : "reps";
      const valueInfo = parseSetValueToken(metric, mWeight[1]);
      const load = parseLoadToken(mWeight[3]);
      if (!valueInfo) return null;
      if (!load) return null;
      return buildSet(metric, valueInfo.value, load.weight, load.unit, load.loadLabel, {
        repsSecondary: valueInfo.repsSecondary,
        loadExpr: load.loadExpr
      });
    }

    const mValue = s.match(/^([0-9]+(?:\.[0-9]+)?(?:\/[0-9]+(?:\.[0-9]+)?)?)\s*(s|m|ft)?$/i);
    if (mValue) {
      const metric = mValue[2] ? normalizeMetricToken(mValue[2]) : "reps";
      const valueInfo = parseSetValueToken(metric, mValue[1]);
      if (!valueInfo) return null;
      return buildSet(metric, valueInfo.value, null, "lb", null, { repsSecondary: valueInfo.repsSecondary });
    }

    return null;
  }
  function parseSetsSpec(spec, previousSet = null) {
    const s = spec.trim();
    if (!s) return null;

    const isBareNumberToken = (token) => /^(\d+(\.\d+)?)$/.test(token);
    const isMultipleOf2Point5 = (n) => Math.abs((n / 2.5) - Math.round(n / 2.5)) < 1e-9;

    function parseBareNumberToken(value, carrySet, preferWeightsOnAmbiguous) {
      if (!Number.isFinite(value) || value <= 0) return null;

      const carryMetric = getSetMetric(carrySet);
      if (!carryMetric || carryMetric.metric === "invalid") {
        if (!Number.isInteger(value)) return null;
        const noCarrySet = buildSet("reps", value, null, "lb");
        return noCarrySet ? [noCarrySet] : null;
      }

      const metric = carryMetric.metric;
      const carryValue = carryMetric.value;
      const carryWeight = carrySet.weight;
      const carryLoadLabel = normalizeLoadLabelToken(carrySet.loadLabel || "");
      const carryLoadExpr = normalizeLoadExprToken(carrySet.loadExpr || "");
      const carryUnit = carrySet.unit || "lb";

      function makeCarriedValueSet(nextValue, nextWeight, nextLoadLabel = carryLoadLabel, nextLoadExpr = carryLoadExpr) {
        if (metric === "reps" && !Number.isInteger(nextValue)) return null;
        return buildSet(metric, nextValue, nextWeight, carryUnit, nextLoadLabel, { loadExpr: nextLoadExpr });
      }

      // If there's no carried weight, a bare number can only be the metric value.
      if (carryWeight == null) {
        const set = makeCarriedValueSet(value, null, carryLoadLabel, carryLoadExpr);
        return set ? [set] : null;
      }

      // Decimal bare numbers are almost always intended as weight.
      if (!Number.isInteger(value)) {
        const set = makeCarriedValueSet(carryValue, value);
        return set ? [set] : null;
      }

      const diffToReps = Math.abs(value - carryValue);
      const diffToWeight = Math.abs(value - carryWeight);

      // If closer to one, assume that number is provided and the other is omitted.
      if (diffToWeight < diffToReps) {
        const set = makeCarriedValueSet(carryValue, value);
        return set ? [set] : null;
      }
      if (diffToReps < diffToWeight) {
        const set = makeCarriedValueSet(value, carryWeight);
        return set ? [set] : null;
      }

      // Ambiguous: use the shared 2.5-multiple heuristic; otherwise default reps.
      if (preferWeightsOnAmbiguous) {
        const set = makeCarriedValueSet(carryValue, value);
        return set ? [set] : null;
      }
      const set = makeCarriedValueSet(value, carryWeight);
      return set ? [set] : null;
    }

    function parseSetToken(token, carrySet, preferWeightsOnAmbiguous) {
      const part = token.trim();
      if (!part) return null;

      const tokenRepeatWeight = part.match(/^(\d+)\s*x\s*([0-9]+(?:\.[0-9]+)?(?:\/[0-9]+(?:\.[0-9]+)?)?)\s*(s|m|ft)?\s*@\s*([^\s]+)\s*$/i);
      if (tokenRepeatWeight) {
        const count = +tokenRepeatWeight[1];
        const metric = tokenRepeatWeight[3] ? normalizeMetricToken(tokenRepeatWeight[3]) : "reps";
        const valueInfo = parseSetValueToken(metric, tokenRepeatWeight[2]);
        const load = parseLoadToken(tokenRepeatWeight[4]);
        if (!valueInfo) return null;
        if (!load) return null;
        if (count <= 0) return null;
        const set = buildSet(metric, valueInfo.value, load.weight, load.unit, load.loadLabel, {
          repsSecondary: valueInfo.repsSecondary,
          loadExpr: load.loadExpr
        });
        if (!set) return null;
        return Array.from({length: count}, () => ({ ...set }));
      }

      const tokenRepeatReps = part.match(/^(\d+)\s*x\s*([0-9]+(?:\.[0-9]+)?(?:\/[0-9]+(?:\.[0-9]+)?)?)\s*(s|m|ft)?\s*$/i);
      if (tokenRepeatReps) {
        const count = +tokenRepeatReps[1];
        const metric = tokenRepeatReps[3] ? normalizeMetricToken(tokenRepeatReps[3]) : "reps";
        const valueInfo = parseSetValueToken(metric, tokenRepeatReps[2]);
        if (count <= 0) return null;
        if (!valueInfo) return null;
        const set = buildSet(metric, valueInfo.value, null, "lb", null, { repsSecondary: valueInfo.repsSecondary });
        if (!set) return null;
        return Array.from({length: count}, () => ({ ...set }));
      }

      if (isBareNumberToken(part)) {
        return parseBareNumberToken(Number(part), carrySet, preferWeightsOnAmbiguous);
      }

      const one = parseSingleSet(part, carrySet);
      return one ? [one] : null;
    }

    if (s.includes(",") || /\s+/.test(s)) {
      const parts = s.includes(",")
        ? s.split(/[,]+/).map(p => p.trim()).filter(Boolean)
        : s.split(/\s+/).map(p => p.trim()).filter(Boolean);

      if (parts.length > 1) {
        const bareValues = parts.filter(isBareNumberToken).map(Number);
        const preferWeightsOnAmbiguous = bareValues.length > 0 && bareValues.every(isMultipleOf2Point5);

        const sets = [];
        let carry = previousSet;
        let ok = true;

        for (const part of parts) {
          const parsedChunk = parseSetToken(part, carry, preferWeightsOnAmbiguous);
          if (!parsedChunk || !parsedChunk.length) {
            ok = false;
            break;
          }
          sets.push(...parsedChunk);
          carry = parsedChunk[parsedChunk.length - 1];
        }

        if (ok && sets.length) return sets;
      }
    }

    const singleBareValues = isBareNumberToken(s) ? [Number(s)] : [];
    const preferWeightsOnAmbiguous = singleBareValues.length > 0 && singleBareValues.every(isMultipleOf2Point5);
    const parsed = parseSetToken(s, previousSet, preferWeightsOnAmbiguous);
    return parsed && parsed.length ? parsed : null;
  }

  function parseWorkoutLine(line) {
    const p = parseDatePrefix(line);
    if (!p) return null;
    const names = p.rest ? p.rest.split(",").map(x => x.trim()).filter(Boolean) : [];
    const exercises = names.map(n => ({ id: uid(), name: n, sets: [] }));
    return { id: uid(), dateISO: p.dateISO, exercises };
  }

  function parseExerciseLine(line) {
    const s = line.trim();
    if (!s) return null;
    const parts = s.split(/\s+/);
    let best = null;

    if (parts.length >= 2) {
      for (let cut = parts.length - 1; cut >= 1; cut--) {
        const name = parts.slice(0, cut).join(" ");
        if (!name.trim()) continue;
        const spec = parts.slice(cut).join(" ");
        const sets = parseSetsSpec(spec);
        if (!sets) continue;

        if (!best ||
            sets.length > best.sets.length ||
            (sets.length === best.sets.length && spec.length > best.specLen)) {
          best = { name: name.trim(), sets, specLen: spec.length };
        }
      }
    }
    if (best) return { name: best.name, sets: best.sets };
    return { name: s, sets: [] };
  }
  function normalizeAutocompleteSelection(rawInput, selectionStart, selectionEnd) {
    const s = String(rawInput || "");
    const max = s.length;
    const startValue = Number(selectionStart);
    const start = Number.isFinite(startValue) ? Math.min(Math.max(startValue, 0), max) : max;
    const endValue = selectionEnd == null ? start : Number(selectionEnd);
    const endCandidate = Number.isFinite(endValue) ? Math.min(Math.max(endValue, 0), max) : start;
    const end = endCandidate < start ? start : endCandidate;
    return { rawInput: s, selectionStart: start, selectionEnd: end };
  }
  function getExerciseAutocompleteMatches(rawQuery) {
    const q = String(rawQuery || "").trim().toLowerCase();
    if (!q) return [];

    const starts = [];
    const contains = [];
    for (const candidate of state.exerciseLookup) {
      const lc = candidate.toLowerCase();
      if (lc === q) continue;
      if (lc.startsWith(q)) starts.push(candidate);
      else if (lc.includes(q)) contains.push(candidate);
    }
    return [...starts, ...contains].slice(0, 6);
  }
  function getExerciseAutocompleteSuggestions(rawInput) {
    return getExerciseAutocompleteMatches(rawInput);
  }
  function applyExerciseAutocompleteSelection(rawInput, suggestion) {
    const s = String(rawInput || "");
    const leadingWs = (s.match(/^\s*/) || [""])[0];
    const value = `${leadingWs}${suggestion}`;
    return { value, cursor: value.length };
  }
  function splitWorkoutDraftForAutocomplete(rawInput, selectionStart, selectionEnd) {
    const sel = normalizeAutocompleteSelection(rawInput, selectionStart, selectionEnd);
    const s = sel.rawInput;
    const m = s.match(/^(\S+)(\s+)(.*)$/);
    if (!m) return null;

    const dateToken = m[1];
    if (!parseDateToken(dateToken)) return null;

    const dateSep = m[2];
    const rest = m[3] || "";
    const restOffset = dateToken.length + dateSep.length;
    if (sel.selectionStart < restOffset) return null;

    const cursorInRest = Math.min(Math.max(sel.selectionStart - restOffset, 0), rest.length);
    const chunkStart = rest.lastIndexOf(",", Math.max(0, cursorInRest - 1)) + 1;
    const chunkEndIndex = rest.indexOf(",", cursorInRest);
    const chunkEnd = chunkEndIndex >= 0 ? chunkEndIndex : rest.length;
    const activeChunk = rest.slice(chunkStart, chunkEnd);
    const leadingWs = (activeChunk.match(/^\s*/) || [""])[0];
    const trailingWs = (activeChunk.match(/\s*$/) || [""])[0];
    const activeName = activeChunk.trim();

    return {
      dateToken,
      dateSep,
      prefix: rest.slice(0, chunkStart),
      suffix: rest.slice(chunkEnd),
      leadingWs,
      trailingWs,
      activeName
    };
  }
  function getWorkoutAutocompleteSuggestions(rawInput, selectionStart, selectionEnd) {
    const split = splitWorkoutDraftForAutocomplete(rawInput, selectionStart, selectionEnd);
    if (!split) return [];
    return getExerciseAutocompleteMatches(split.activeName);
  }
  function applyWorkoutAutocompleteSelection(rawInput, suggestion, selectionStart, selectionEnd) {
    const split = splitWorkoutDraftForAutocomplete(rawInput, selectionStart, selectionEnd);
    if (!split) return { value: String(rawInput || ""), cursor: String(rawInput || "").length };

    const rest = `${split.prefix}${split.leadingWs}${suggestion}${split.trailingWs}${split.suffix}`;
    const value = `${split.dateToken}${split.dateSep}${rest}`;
    const cursor = split.dateToken.length + split.dateSep.length + split.prefix.length + split.leadingWs.length + suggestion.length;
    return { value, cursor };
  }

  function getSummarizedSetGroups(sets) {
    if (!Array.isArray(sets) || !sets.length) return [];

    const formatMetricValue = (metric, value, secondary = null) => {
      const hasSecondary = Number.isFinite(Number(secondary)) && Number(secondary) > 0;
      const base = hasSecondary
        ? `${trimNum(value)}/${trimNum(Number(secondary))}`
        : `${trimNum(value)}`;
      if (metric === "seconds") return `${base}s`;
      if (metric === "meters") return `${base}m`;
      if (metric === "feet") return `${base}ft`;
      return `${value}`;
    };
    const formatOne = (set) => {
      if (set.invalid) return String(set.raw || "?");
      const metricInfo = getSetMetric(set);
      if (!metricInfo || metricInfo.metric === "invalid") return String(set.raw || "?");

      const base = metricInfo.metric === "reps"
        ? (metricInfo.display || `${metricInfo.value}`)
        : formatMetricValue(metricInfo.metric, metricInfo.value, metricInfo.secondary);
      return `${base}${formatSetLoadSuffix(set, false)}`;
    };
    const formatGrouped = (count, set) => {
      if (count <= 1) return formatOne(set);
      return `${count}x${formatOne(set)}`;
    };

    const groups = [];
    let current = { ...sets[0], count: 1 };

    for (let i = 1; i < sets.length; i++) {
      const next = sets[i];
      const currentMetric = getSetMetric(current);
      const nextMetric = getSetMetric(next);
      const same = !current.invalid &&
        !next.invalid &&
        currentMetric &&
        nextMetric &&
        currentMetric.metric === nextMetric.metric &&
        currentMetric.value === nextMetric.value &&
        (currentMetric.display || "") === (nextMetric.display || "") &&
        next.weight === current.weight &&
        normalizeLoadExprToken(next.loadExpr || "") === normalizeLoadExprToken(current.loadExpr || "") &&
        normalizeLoadLabelToken(next.loadLabel || "") === normalizeLoadLabelToken(current.loadLabel || "") &&
        normalizeUnitToken(next.unit || "lb") === normalizeUnitToken(current.unit || "lb");
      if (same) {
        current.count += 1;
      } else {
        groups.push(current);
        current = { ...next, count: 1 };
      }
    }
    groups.push(current);

    return groups.map(group => ({
      count: group.count,
      set: group,
      text: formatGrouped(group.count, group)
    }));
  }
  function summarizeSets(sets) {
    const groups = getSummarizedSetGroups(sets);
    if (!groups.length) return "";
    return groups.map(group => group.text).join(" ");
  }

  function formatSetLine(s) {
    if (s.invalid) return String(s.raw || "?");
    const metricInfo = getSetMetric(s);
    if (!metricInfo || metricInfo.metric === "invalid") return String(s.raw || "?");

    const value = metricInfo.metric === "seconds"
      ? `${metricInfo.display || trimNum(metricInfo.value)}s`
      : metricInfo.metric === "meters"
        ? `${metricInfo.display || trimNum(metricInfo.value)}m`
        : metricInfo.metric === "feet"
          ? `${metricInfo.display || trimNum(metricInfo.value)}ft`
          : (metricInfo.display || `${metricInfo.value}`);
    return `${value}${formatSetLoadSuffix(s, true)}`;
  }
  function formatSetEdit(s) {
    if (s.invalid) return String(s.raw || "");
    const metricInfo = getSetMetric(s);
    if (!metricInfo || metricInfo.metric === "invalid") return String(s.raw || "");

    const value = metricInfo.metric === "seconds"
      ? `${metricInfo.display || trimNum(metricInfo.value)}s`
      : metricInfo.metric === "meters"
        ? `${metricInfo.display || trimNum(metricInfo.value)}m`
        : metricInfo.metric === "feet"
          ? `${metricInfo.display || trimNum(metricInfo.value)}ft`
          : (metricInfo.display || `${metricInfo.value}`);
    return `${value}${formatSetLoadSuffix(s, false)}`;
  }

  function findWorkout(id) { return state.workouts.find(w => w.id === id) || null; }
  function findExercise(w, exId) { return w.exercises.find(e => e.id === exId) || null; }
  function setCurrentWorkout(workoutId) {
    state.current = { kind:"workout", workoutId };
  }
  function setCurrentExercise(workoutId, exerciseId) {
    state.current = { kind:"exercise", workoutId, exerciseId };
  }
  function setCurrentSet(workoutId, exerciseId, setIndex) {
    state.current = { kind:"set", workoutId, exerciseId, setIndex };
  }
  function isCurrentWorkout(workoutId) {
    return !!state.current && state.current.kind === "workout" && state.current.workoutId === workoutId;
  }
  function isCurrentExercise(workoutId, exerciseId) {
    return !!state.current &&
      state.current.kind === "exercise" &&
      state.current.workoutId === workoutId &&
      state.current.exerciseId === exerciseId;
  }
  function isCurrentSet(workoutId, exerciseId, setIndex) {
    return !!state.current &&
      state.current.kind === "set" &&
      state.current.workoutId === workoutId &&
      state.current.exerciseId === exerciseId &&
      state.current.setIndex === setIndex;
  }
  function getCurrentExerciseForHistory(workout) {
    if (!workout || !state.current || state.current.workoutId !== workout.id) return null;
    if (state.current.kind === "exercise") {
      return findExercise(workout, state.current.exerciseId);
    }
    if (state.current.kind === "set") {
      return findExercise(workout, state.current.exerciseId);
    }
    return null;
  }
  function getExerciseHistoryRows(workout, exercise) {
    if (!workout || !exercise) return [];
    const targetKey = normalizeExerciseName(exercise.name).toLowerCase();
    if (!targetKey) return [];

    const rows = [];
    for (let i = state.workouts.length - 1; i >= 0; i--) {
      const candidate = state.workouts[i];
      if (candidate.id === workout.id) continue;
      if (candidate.dateISO >= workout.dateISO) continue;

      const match = candidate.exercises.find(item => normalizeExerciseName(item.name).toLowerCase() === targetKey);
      if (!match) continue;
      const summary = summarizeSets(match.sets || []);
      if (!summary) continue;
      rows.push({ dateISO: candidate.dateISO, summary, sets: match.sets || [] });
    }
    return rows;
  }
  function parseNumericFilter(raw) {
    const t = String(raw || "").trim();
    if (!t) return null;
    const m = t.match(/^(<=|>=|<|>|=)?\s*(-?\d+(\.\d+)?)$/);
    if (!m) return { invalid:true, op:"=", value:0 };
    return { invalid:false, op:m[1] || "=", value:Number(m[2]) };
  }
  function passesNumericFilter(value, rule) {
    if (!rule || rule.invalid) return false;
    if (!Number.isFinite(value)) return false;
    switch (rule.op) {
      case "<": return value < rule.value;
      case "<=": return value <= rule.value;
      case ">": return value > rule.value;
      case ">=": return value >= rule.value;
      case "=":
      default:
        return value === rule.value;
    }
  }
  function getSetComparableWeightLb(set) {
    if (!set || typeof set !== "object") return null;

    const directWeight = Number(set.weight);
    if (Number.isFinite(directWeight)) {
      return normalizeUnitToken(set.unit || "lb") === "kg" ? (directWeight * 2.2046226218) : directWeight;
    }

    const expr = normalizeLoadExprToken(set.loadExpr || "");
    if (!expr) return null;

    const unit = expr.endsWith("kg") ? "kg" : "lb";
    const core = unit === "kg" ? expr.slice(0, -2) : (expr.endsWith("lb") ? expr.slice(0, -2) : expr);
    const op = core.includes("/") ? "/" : (core.includes("+") ? "+" : null);
    const pieces = op ? core.split(op) : [core];
    if (!pieces.length) return null;

    const numbers = pieces.map(piece => Number(piece));
    if (numbers.some(n => !Number.isFinite(n))) return null;
    if (!numbers.length) return null;
    const comparable = Math.max(...numbers);
    return unit === "kg" ? (comparable * 2.2046226218) : comparable;
  }
  function setMatchesHistoryFilters(set, weightRule, repsRule) {
    if (!set || typeof set !== "object" || set.invalid) return false;

    if (repsRule) {
      const metricInfo = getSetMetric(set);
      if (!metricInfo || metricInfo.metric !== "reps") return false;
      if (!passesNumericFilter(Number(metricInfo.value), repsRule)) return false;
    }

    if (weightRule) {
      const weightLb = getSetComparableWeightLb(set);
      if (!Number.isFinite(weightLb)) return false;
      if (!passesNumericFilter(weightLb, weightRule)) return false;
    }

    return true;
  }
  function setMatchesRepMaxFocus(set, maxFocus) {
    if (!set || !maxFocus || typeof set !== "object" || set.invalid) return false;
    const metricInfo = getSetMetric(set);
    if (!metricInfo || metricInfo.metric !== "reps") return false;
    if (!Number.isFinite(set.weight)) return false;
    if (Number(metricInfo.value) !== Number(maxFocus.reps)) return false;

    const unit = normalizeUnitToken(set.unit || "lb");
    const focusUnit = normalizeUnitToken(maxFocus.unit || "lb");
    if (unit !== focusUnit) return false;
    return Math.abs(Number(set.weight) - Number(maxFocus.weight)) < 1e-9;
  }
  function getExerciseRepMaxEntries(historyRows) {
    if (!historyRows || !historyRows.length) return [];

    const maxByReps = new Map();
    for (let rowIndex = 0; rowIndex < historyRows.length; rowIndex++) {
      const row = historyRows[rowIndex];
      const sets = Array.isArray(row.sets) ? row.sets : [];
      for (const set of sets) {
        if (!set || typeof set !== "object" || set.invalid) continue;
        const metricInfo = getSetMetric(set);
        if (!metricInfo || metricInfo.metric !== "reps") continue;
        if (!Number.isFinite(set.weight)) continue;

        const reps = Number(metricInfo.value);
        if (!Number.isInteger(reps) || reps <= 0) continue;

        const weight = Number(set.weight);
        const unit = normalizeUnitToken(set.unit || "lb");
        const comparable = unit === "kg" ? weight * 2.2046226218 : weight;
        const prev = maxByReps.get(reps);
        if (!prev || comparable > prev.comparable) {
          maxByReps.set(reps, { reps, weight, unit, comparable, rowIndex });
        }
      }
    }

    return [...maxByReps.values()]
      .sort((a, b) => a.reps - b.reps)
      .map((item) => ({
        reps: item.reps,
        weight: item.weight,
        unit: item.unit,
        rowIndex: item.rowIndex,
        label: `${item.reps}@${trimNum(item.weight)}${item.unit === "kg" ? "kg" : ""}`
      }));
  }
  function renderHistoryDrawer(activeWorkout) {
    if (!elHistoryDrawer || !elHistoryTab || !elHistoryChevron || !elHistoryList || !elHistoryMeta ||
        !elHistoryFilterBtn || !elHistoryFilterIcon || !elHistoryFilterBar ||
        !elHistoryWeightFilterInput || !elHistoryRepsFilterInput) {
      return;
    }

    const hide = () => {
      elHistoryList.innerHTML = "";
      elHistoryDrawer.classList.add("hidden");
      elHistoryDrawer.classList.remove("show", "open");
      elHistoryTab.setAttribute("aria-expanded", "false");
      elHistoryChevron.innerHTML = HISTORY_CHEVRON_UP;
      elHistoryMeta.textContent = "";
      elHistoryMeta.classList.remove("show");
      elHistoryFilterBtn.classList.add("hidden");
      elHistoryFilterBtn.classList.remove("active");
      elHistoryFilterBar.classList.remove("show");
      elHistoryFilterBar.classList.add("hidden");
    };

    if (state.screen !== "workout" || !activeWorkout) {
      state.historyOpen = false;
      state.historyMaxFocus = null;
      state.historyFilterOpen = false;
      state.historyFilterWeight = "";
      state.historyFilterReps = "";
      hide();
      return;
    }

    const currentExercise = getCurrentExerciseForHistory(activeWorkout);
    if (!currentExercise) {
      state.historyOpen = false;
      state.historyMaxFocus = null;
      state.historyFilterOpen = false;
      state.historyFilterWeight = "";
      state.historyFilterReps = "";
      hide();
      return;
    }

    const rows = getExerciseHistoryRows(activeWorkout, currentExercise);
    if (!state.historyOpen) {
      state.historyFilterOpen = false;
      state.historyFilterWeight = "";
      state.historyFilterReps = "";
    }

    const rawWeightFilter = String(state.historyFilterWeight || "").trim();
    const rawRepsFilter = String(state.historyFilterReps || "").trim();
    const weightRule = rawWeightFilter ? parseNumericFilter(rawWeightFilter) : null;
    const repsRule = rawRepsFilter ? parseNumericFilter(rawRepsFilter) : null;
    const hasAnyFilter = !!rawWeightFilter || !!rawRepsFilter;
    const hasInvalidFilter = (weightRule && weightRule.invalid) || (repsRule && repsRule.invalid);

    const visibleRows = [];
    for (const row of rows) {
      const allSets = Array.isArray(row.sets) ? row.sets : [];
      const sets = !hasAnyFilter
        ? allSets
        : (hasInvalidFilter ? [] : allSets.filter(set => setMatchesHistoryFilters(set, weightRule, repsRule)));
      if (!sets.length) continue;
      visibleRows.push({ dateISO: row.dateISO, sets });
    }

    const maxEntries = getExerciseRepMaxEntries(visibleRows.map(row => ({ sets: row.sets })));
    if (state.historyMaxFocus) {
      const focus = state.historyMaxFocus;
      const focusRow = visibleRows[focus.rowIndex];
      const stillVisible = !!focusRow && Array.isArray(focusRow.sets) && focusRow.sets.some(set => setMatchesRepMaxFocus(set, focus));
      if (!stillVisible) state.historyMaxFocus = null;
    }
    const activeMaxFocus = state.historyMaxFocus;
    elHistoryList.innerHTML = "";
    for (let rowIndex = 0; rowIndex < visibleRows.length; rowIndex++) {
      const row = visibleRows[rowIndex];
      const groups = getSummarizedSetGroups(row.sets);
      if (!groups.length) continue;
      const line = document.createElement("div");
      line.className = "historyRow";
      line.dataset.historyRowIndex = String(rowIndex);

      const datePart = document.createElement("span");
      datePart.className = "historyRowDate";
      datePart.textContent = fmtDateDisplay(row.dateISO);
      line.appendChild(datePart);
      line.appendChild(document.createTextNode(" "));

      const summaryPart = document.createElement("span");
      summaryPart.className = "historyRowSummary";

      let rowHasMatch = false;
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (i > 0) summaryPart.appendChild(document.createTextNode(" "));

        const token = document.createElement("span");
        token.className = "historySetToken";
        token.textContent = group.text;

        const isMatch = !!activeMaxFocus &&
          activeMaxFocus.rowIndex === rowIndex &&
          setMatchesRepMaxFocus(group.set, activeMaxFocus);
        if (isMatch) {
          token.classList.add("historySetTokenMatch");
          rowHasMatch = true;
        }
        summaryPart.appendChild(token);
      }

      if (rowHasMatch) line.classList.add("historyRowFocus");
      line.appendChild(summaryPart);
      elHistoryList.appendChild(line);
    }

    elHistoryDrawer.classList.remove("hidden");
    elHistoryDrawer.classList.add("show");
    elHistoryDrawer.classList.toggle("open", !!state.historyOpen);
    elHistoryTab.setAttribute("aria-expanded", state.historyOpen ? "true" : "false");
    elHistoryChevron.innerHTML = state.historyOpen ? HISTORY_CHEVRON_DOWN : HISTORY_CHEVRON_UP;

    if (!elHistoryFilterIcon.innerHTML.trim()) {
      elHistoryFilterIcon.innerHTML = HISTORY_FILTER_ICON;
    }
    const showFilterBar = !!state.historyOpen && !!state.historyFilterOpen;
    elHistoryFilterBtn.classList.toggle("hidden", !state.historyOpen);
    elHistoryFilterBtn.classList.toggle("active", showFilterBar);
    elHistoryFilterBar.classList.toggle("show", showFilterBar);
    elHistoryFilterBar.classList.toggle("hidden", !showFilterBar);
    if (elHistoryWeightFilterInput.value !== state.historyFilterWeight) {
      elHistoryWeightFilterInput.value = state.historyFilterWeight;
    }
    if (elHistoryRepsFilterInput.value !== state.historyFilterReps) {
      elHistoryRepsFilterInput.value = state.historyFilterReps;
    }

    elHistoryMeta.innerHTML = "";
    if (state.historyOpen && maxEntries.length) {
      const label = document.createElement("span");
      label.className = "historyMetaLabel";
      label.textContent = "Maxes:";
      elHistoryMeta.appendChild(label);

      for (const entry of maxEntries) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "historyMaxBtn";
        btn.textContent = entry.label;
        btn.title = `Scroll to ${entry.label}`;

        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          state.historyMaxFocus = {
            rowIndex: entry.rowIndex,
            reps: entry.reps,
            weight: entry.weight,
            unit: entry.unit
          };
          renderHistoryDrawer(activeWorkout);
          const target = elHistoryList.querySelector(`[data-history-row-index="${entry.rowIndex}"]`);
          if (target) target.scrollIntoView({ block:"nearest" });
        });
        elHistoryMeta.appendChild(btn);
      }
    }
    elHistoryMeta.classList.toggle("show", !!maxEntries.length && !!state.historyOpen);
  }

  function removeWorkout(workoutId) {
    state.workouts = state.workouts.filter(item => item.id !== workoutId);
    if (state.mainExpandedWorkoutId === workoutId) state.mainExpandedWorkoutId = null;
    if (state.expandedWorkoutId === workoutId) {
      state.expandedWorkoutId = null;
      state.expandedExerciseId = null;
      if (state.screen === "workout") {
        state.screen = "main";
        state.mainAddOpen = false;
      }
    }
    if (state.current && state.current.workoutId === workoutId) state.current = null;
    if (state.edit && state.edit.workoutId === workoutId) state.edit = null;
  }
  function removeAllWorkouts() {
    state.workouts = [];
    state.screen = "main";
    state.mainAddOpen = false;
    state.historyOpen = false;
    state.historyFilterOpen = false;
    state.historyFilterWeight = "";
    state.historyFilterReps = "";
    state.mainExpandedWorkoutId = null;
    state.expandedWorkoutId = null;
    state.expandedExerciseId = null;
    state.current = null;
    state.edit = null;
    rebuildExerciseLookup();
  }
  function removeExercise(workout, exerciseId) {
    workout.exercises = workout.exercises.filter(item => item.id !== exerciseId);
    if (state.expandedExerciseId === exerciseId) state.expandedExerciseId = null;
    if (state.current &&
        state.current.workoutId === workout.id &&
        (state.current.kind === "exercise" || state.current.kind === "set") &&
        state.current.exerciseId === exerciseId) {
      setCurrentWorkout(workout.id);
    }
    if (state.edit && state.edit.workoutId === workout.id && state.edit.exerciseId === exerciseId) {
      state.edit = null;
    }
  }
  function removeSet(workout, exercise, setIndex) {
    if (setIndex < 0 || setIndex >= exercise.sets.length) return;
    exercise.sets.splice(setIndex, 1);

    if (state.current &&
        state.current.kind === "set" &&
        state.current.workoutId === workout.id &&
        state.current.exerciseId === exercise.id) {
      if (state.current.setIndex === setIndex) {
        setCurrentExercise(workout.id, exercise.id);
      } else if (state.current.setIndex > setIndex) {
        state.current.setIndex -= 1;
      }
    }

    if (state.edit &&
        state.edit.kind === "set" &&
        state.edit.workoutId === workout.id &&
        state.edit.exerciseId === exercise.id) {
      if (state.edit.setIndex === setIndex) {
        state.edit = null;
      } else if (state.edit.setIndex > setIndex) {
        state.edit.setIndex -= 1;
      }
    }
  }
  function makeDeleteButton(onDelete, renderOpts) {
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "rowDeleteBtn";
    deleteBtn.setAttribute("aria-label", "Delete");
    deleteBtn.setAttribute("title", "Delete");
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
        <path d="M3 6h18"></path>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    deleteBtn.addEventListener("pointerup", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.edit) return;
      onDelete();
      save();
      render(renderOpts);
    }, { passive:false });
    return deleteBtn;
  }
  function makeEditButton(onEdit) {
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "rowEditBtn";
    editBtn.setAttribute("aria-label", "Open workout");
    editBtn.setAttribute("title", "Open workout");
    editBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
        <path d="m15 5 4 4"></path>
      </svg>
    `;
    editBtn.addEventListener("pointerup", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.edit) return;
      onEdit();
    }, { passive:false });
    return editBtn;
  }

  // ---------- Tap / Double-tap ----------
  function bindTapHandlers(node, { onTap, onDoubleTap }) {
    let lastTapTime = 0;
    let tapTimer = null;
    const DOUBLE_MS = 260;
    const INTERACTIVE_SELECTOR = "input, textarea, select, button, .btn, .rowDeleteBtn, .inputRow, .autocompleteList, .autocompleteItem";

    const handler = (ev) => {
      const target = ev.target instanceof Element ? ev.target : null;
      if (target && target.closest(INTERACTIVE_SELECTOR)) return;

      ev.preventDefault();
      ev.stopPropagation();
      const now = Date.now();
      const delta = now - lastTapTime;

      if (delta > 0 && delta < DOUBLE_MS) {
        lastTapTime = 0;
        if (tapTimer) { clearTimeout(tapTimer); tapTimer = null; }
        onDoubleTap && onDoubleTap(ev);
      } else {
        lastTapTime = now;
        if (tapTimer) clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
          tapTimer = null;
          onTap && onTap(ev);
        }, DOUBLE_MS);
      }
    };

    node.addEventListener("pointerup", handler, { passive:false });
  }

  // ---------- In-place editor widget ----------
  function makeInlineEditor({
    placeholder,
    value,
    onCommit,
    onCancel,
    compact=false,
    clearOnCancel=false,
    autocompleteExercise=false,
    autocompleteWorkout=false
  }) {
    const wrapper = document.createElement("div");
    wrapper.className = "inlineEditor";

    const row = document.createElement("div");
    row.className = "inputRow" + (compact ? " compact" : "");

    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.autocapitalize = "sentences";
    input.spellcheck = false;
    input.placeholder = placeholder || "";
    input.value = value || "";

    const ok = document.createElement("div");
    ok.className = "btn ok";
    ok.textContent = "✓";
    ok.title = "OK";

    const cancel = document.createElement("div");
    cancel.className = "btn cancel";
    cancel.textContent = "×";
    cancel.title = clearOnCancel ? "Clear" : "Cancel";

    let autocompleteList = null;
    let autocompleteItems = [];
    let autocompleteActiveIndex = -1;
    const autocompleteEnabled = autocompleteExercise || autocompleteWorkout;
    const getSuggestions = autocompleteWorkout ? getWorkoutAutocompleteSuggestions : getExerciseAutocompleteSuggestions;
    const applySuggestion = autocompleteWorkout ? applyWorkoutAutocompleteSelection : applyExerciseAutocompleteSelection;

    function setAutocompleteActive(nextIndex) {
      autocompleteActiveIndex = nextIndex;
      for (let i = 0; i < autocompleteItems.length; i++) {
        autocompleteItems[i].classList.toggle("isActive", i === autocompleteActiveIndex);
      }
    }
    function applyAutocompleteSuggestion(suggestion) {
      const next = applySuggestion(input.value, suggestion, input.selectionStart, input.selectionEnd);
      const nextValue = typeof next === "string" ? next : (next && typeof next.value === "string" ? next.value : input.value);
      const cursor = typeof next === "string"
        ? nextValue.length
        : (next && Number.isFinite(next.cursor) ? next.cursor : nextValue.length);
      input.value = nextValue;
      input.focus();
      input.setSelectionRange(cursor, cursor);
      renderAutocomplete();
    }
    function hideAutocomplete() {
      if (!autocompleteList) return;
      autocompleteList.innerHTML = "";
      autocompleteItems = [];
      autocompleteActiveIndex = -1;
      autocompleteList.classList.remove("show");
    }
    function renderAutocomplete() {
      if (!autocompleteList) return;

      const suggestions = getSuggestions(input.value, input.selectionStart, input.selectionEnd);
      const activeSuggestion = autocompleteActiveIndex >= 0 && autocompleteActiveIndex < autocompleteItems.length
        ? autocompleteItems[autocompleteActiveIndex].textContent
        : "";
      autocompleteList.innerHTML = "";
      autocompleteItems = [];
      autocompleteActiveIndex = -1;
      if (!suggestions.length) {
        autocompleteList.classList.remove("show");
        return;
      }

      let restoredIndex = -1;
      for (const suggestion of suggestions) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "autocompleteItem";
        btn.textContent = suggestion;
        btn.addEventListener("pointerdown", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
        }, { passive:false });
        btn.addEventListener("pointerup", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          applyAutocompleteSuggestion(suggestion);
        }, { passive:false });
        autocompleteList.appendChild(btn);
        autocompleteItems.push(btn);
        if (activeSuggestion && suggestion === activeSuggestion && restoredIndex < 0) {
          restoredIndex = autocompleteItems.length - 1;
        }
      }

      autocompleteList.classList.add("show");
      if (restoredIndex >= 0) setAutocompleteActive(restoredIndex);
    }

    ok.addEventListener("pointerup", (e) => { e.preventDefault(); onCommit(input.value); }, { passive:false });
    cancel.addEventListener("pointerup", (e) => {
      e.preventDefault();
      if (clearOnCancel) {
        if (!input.value.trim()) {
          onCancel();
        } else {
          input.value = "";
          input.focus();
          if (autocompleteEnabled) renderAutocomplete();
        }
      } else {
        onCancel();
      }
    }, { passive:false });

    input.addEventListener("keydown", (e) => {
      const hasAutocomplete = autocompleteEnabled &&
        autocompleteList &&
        autocompleteList.classList.contains("show") &&
        autocompleteItems.length > 0;

      if (hasAutocomplete && e.key === "ArrowDown") {
        e.preventDefault();
        const next = autocompleteActiveIndex < autocompleteItems.length - 1 ? autocompleteActiveIndex + 1 : 0;
        setAutocompleteActive(next);
        return;
      }
      if (hasAutocomplete && e.key === "ArrowUp") {
        e.preventDefault();
        const next = autocompleteActiveIndex > 0 ? autocompleteActiveIndex - 1 : autocompleteItems.length - 1;
        setAutocompleteActive(next);
        return;
      }

      if (e.key === "Enter") {
        if (hasAutocomplete && autocompleteActiveIndex >= 0) {
          e.preventDefault();
          const activeBtn = autocompleteItems[autocompleteActiveIndex];
          if (activeBtn) applyAutocompleteSuggestion(activeBtn.textContent || "");
          return;
        }
        e.preventDefault();
        onCommit(input.value);
      }
      else if (e.key === "Escape") {
        e.preventDefault();
        if (autocompleteEnabled && autocompleteList && autocompleteList.classList.contains("show")) {
          hideAutocomplete();
          return;
        }
        if (clearOnCancel) {
          if (!input.value.trim()) onCancel();
          else {
            input.value = "";
            input.focus();
          }
        } else {
          onCancel();
        }
      }
    });

    if (autocompleteEnabled) {
      autocompleteList = document.createElement("div");
      autocompleteList.className = "autocompleteList";
      input.addEventListener("input", renderAutocomplete);
      input.addEventListener("focus", renderAutocomplete);
      input.addEventListener("pointerup", () => queueMicrotask(renderAutocomplete));
      input.addEventListener("keyup", (ev) => {
        if (ev.key === "ArrowLeft" || ev.key === "ArrowRight" || ev.key === "Home" || ev.key === "End") {
          renderAutocomplete();
        }
      });
      input.addEventListener("blur", () => setTimeout(hideAutocomplete, 120));
    }

    row.appendChild(input);
    row.appendChild(ok);
    row.appendChild(cancel);
    wrapper.appendChild(row);
    if (autocompleteList) wrapper.appendChild(autocompleteList);

    wrapper._focus = () => {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      if (autocompleteEnabled) renderAutocomplete();
    };

    return wrapper;
  }

  // ---------- Actions ----------
  function beginEditWorkout(w) {
    setCurrentWorkout(w.id);
    state.edit = { kind:"workout", workoutId: w.id, draft: fmtDateDisplay(w.dateISO) };
    render({ focusEdit:true });
  }
  function beginEditExercise(w, ex) {
    setCurrentExercise(w.id, ex.id);
    const summary = summarizeSets(ex.sets);
    state.edit = { kind:"exercise", workoutId:w.id, exerciseId:ex.id, draft: summary ? `${ex.name} ${summary}` : ex.name };
    render({ focusEdit:true });
  }
  function beginEditSet(w, ex, idx) {
    setCurrentSet(w.id, ex.id, idx);
    state.edit = { kind:"set", workoutId:w.id, exerciseId:ex.id, setIndex:idx, draft: formatSetEdit(ex.sets[idx]) };
    render({ focusEdit:true });
  }
  function cancelEdit() {
    state.edit = null;
    render();
  }

  function commitEdit(text) {
    const t = text.trim();
    const edit = state.edit;
    if (!edit) return;

    const w = findWorkout(edit.workoutId);
    if (!w) { state.edit=null; render(); return; }

    if (edit.kind === "workout") {
      if (isDeleteToken(t)) {
        removeWorkout(w.id);
        state.edit = null;
        save();
        render();
        return;
      }

      const p = parseDatePrefix(t);
      if (!p) return;
      w.dateISO = p.dateISO;
      state.edit = null;
      sortWorkoutsAsc();
      save();
      render();
      return;
    }

    if (edit.kind === "exercise") {
      const ex = findExercise(w, edit.exerciseId);
      if (!ex) { state.edit=null; render(); return; }

      if (isDeleteToken(t)) {
        removeExercise(w, ex.id);
        state.edit = null;
        save();
        render({ focusAddExercise:true });
        return;
      }

      const parsed = parseExerciseLine(t);
      if (!parsed) return;
      ex.name = parsed.name;
      if (parsed.sets && parsed.sets.length) ex.sets = parsed.sets;
      state.edit = null;
      save();
      render();
      return;
    }

    if (edit.kind === "set") {
      const ex = findExercise(w, edit.exerciseId);
      if (!ex) { state.edit=null; render(); return; }
      const idx = edit.setIndex ?? -1;
      if (idx < 0 || idx >= ex.sets.length) { state.edit=null; render(); return; }

      if (isDeleteToken(t)) {
        removeSet(w, ex, idx);
        state.edit = null;
        save();
        render();
        return;
      }

      if (!t) return;
      const prev = idx > 0 ? ex.sets[idx - 1] : null;
      const set = parseSingleSet(t, prev) || makeInvalidSet(t);
      ex.sets[idx] = set;
      state.edit = null;
      save();
      render();
      return;
    }
  }

  function commitAdd(text) {
    const t = text.trim();
    if (!t) return;

    if (state.screen !== "workout") {
      const w = parseWorkoutLine(t);
      if (!w) return;
      state.workouts.push(w);
      sortWorkoutsAsc();
      state.mainAddOpen = false;
      openWorkoutScreen(w.id);
      if (w.exercises.length) {
        const firstExercise = w.exercises[0];
        state.expandedExerciseId = firstExercise.id;
        setCurrentExercise(w.id, firstExercise.id);
        save();
        render({ scrollBottom:true, focusAddSet:true });
        return;
      }
      save();
      render({ scrollBottom:true, focusAddExercise:true });
      return;
    }

    const w = findWorkout(state.expandedWorkoutId);
    if (!w) {
      setScreenMain();
      render();
      return;
    }

    if (!state.expandedExerciseId) {
      const parsed = parseExerciseLine(t);
      if (!parsed) return;
      const addedExercise = { id: uid(), name: parsed.name, sets: parsed.sets || [] };
      w.exercises.push(addedExercise);
      if (addedExercise.sets.length) {
        setCurrentWorkout(w.id);
        save();
        render({ scrollBottom:true, focusAddExercise:true });
        return;
      }
      state.expandedExerciseId = addedExercise.id;
      setCurrentExercise(w.id, addedExercise.id);
      save();
      render({ scrollBottom:true, focusAddSet:true });
      return;
    }

    const ex = findExercise(w, state.expandedExerciseId);
    if (!ex) { state.expandedExerciseId=null; render(); return; }
    const prev = ex.sets.length ? ex.sets[ex.sets.length - 1] : null;
    const sets = parseSetsSpec(t, prev);
    if (sets && sets.length) ex.sets.push(...sets);
    else ex.sets.push(makeInvalidSet(t));
    save();
    render({ scrollBottom:true, focusAddSet:true });
  }

  // ---------- Render ----------
  function render(opts = {}) {
    sortWorkoutsAsc();
    coerceCurrentToVisible();
    elList.innerHTML = "";
    if (elMainAddHost) elMainAddHost.innerHTML = "";

    let focusTarget = null;
    let activeWorkout = state.screen === "workout" ? findWorkout(state.expandedWorkoutId) : null;
    if (state.screen === "workout" && !activeWorkout) {
      setScreenMain();
      activeWorkout = null;
    }
    updateTitleBar(activeWorkout);

    if (state.screen === "main") {
      const workoutsDesc = [...state.workouts].sort((a, b) => b.dateISO.localeCompare(a.dateISO));

      if (!state.edit && state.mainAddOpen && elMainAddHost) {
        const add = makeInlineEditor({
          placeholder: "Date Exercise1, Exercise2, ...",
          value: `${fmtDateDisplay(todayISO())} `,
          onCommit: (txt) => commitAdd(txt),
          onCancel: () => {
            state.mainAddOpen = false;
            render();
          },
          autocompleteWorkout:true
        });
        elMainAddHost.appendChild(add);
        focusTarget = add;
      }

      for (const w of workoutsDesc) {
        const row = document.createElement("div");
        row.className = "row";
        row.dataset.workoutId = w.id;
        const isMainExpanded = state.mainExpandedWorkoutId === w.id;

        const line = document.createElement("div");
        line.className = "workoutLine";
        const isCurrentWorkoutRow = isCurrentWorkout(w.id);
        if (isCurrentWorkoutRow) line.classList.add("currentFocus");

        const date = document.createElement("div");
        date.className = "date";
        date.textContent = fmtDateDisplay(w.dateISO);

        const dow = document.createElement("div");
        dow.className = "dow";
        dow.textContent = dowShort(w.dateISO);

        const text = document.createElement("div");
        text.className = "workoutText";
        text.textContent = w.exercises.map(e => e.name).join(", ");

        line.appendChild(date);
        line.appendChild(dow);
        line.appendChild(text);
        if (isCurrentWorkoutRow) {
          const spacer = document.createElement("div");
          spacer.className = "rowSpacer";
          line.appendChild(spacer);
          const actions = document.createElement("div");
          actions.className = "rowActions";
          actions.appendChild(makeEditButton(() => {
            if (!openWorkoutScreen(w.id)) return;
            save();
            render({ focusAddExercise:true });
          }));
          actions.appendChild(makeDeleteButton(() => removeWorkout(w.id)));
          line.appendChild(actions);
        }

        row.appendChild(line);
        if (isMainExpanded) {
          const details = document.createElement("div");
          details.className = "mainWorkoutDetails";
          for (const ex of w.exercises) {
            const detailLine = document.createElement("div");
            detailLine.className = "mainWorkoutDetail";

            const detailName = document.createElement("span");
            detailName.className = "mainWorkoutDetailName";
            detailName.textContent = ex.name;
            detailLine.appendChild(detailName);

            const detailSummary = document.createElement("span");
            detailSummary.className = "mainWorkoutDetailSummary";
            detailSummary.textContent = summarizeSets(ex.sets);
            detailLine.appendChild(detailSummary);

            details.appendChild(detailLine);
          }
          row.appendChild(details);
        }
        row.addEventListener("pointerup", (ev) => {
          const target = ev.target instanceof Element ? ev.target : null;
          if (target && target.closest(".rowDeleteBtn, .rowEditBtn")) return;
          if (state.edit) return;
          ev.preventDefault();
          ev.stopPropagation();
          const wasExpanded = state.mainExpandedWorkoutId === w.id;
          state.mainExpandedWorkoutId = wasExpanded ? null : w.id;
          if (wasExpanded) {
            if (isCurrentWorkout(w.id)) state.current = null;
          } else {
            setCurrentWorkout(w.id);
          }
          save();
          render();
        }, { passive:false });

        elList.appendChild(row);
      }
    } else if (activeWorkout) {
      const w = activeWorkout;

      if (state.edit && state.edit.kind === "workout" && state.edit.workoutId === w.id) {
        const editRow = document.createElement("div");
        editRow.className = "row";
        const editor = makeInlineEditor({
          placeholder: "2026.03.05 or t",
          value: state.edit.draft,
          onCommit: commitEdit,
          onCancel: cancelEdit
        });
        editRow.appendChild(editor);
        elList.appendChild(editRow);
        focusTarget = editor;
      }

      const wRow = document.createElement("div");
      wRow.className = "row";
      wRow.dataset.workoutId = w.id;

      for (const ex of w.exercises) {
        const isExpandedEx = state.expandedExerciseId === ex.id;

        if (state.edit && state.edit.kind === "exercise" && state.edit.workoutId === w.id && state.edit.exerciseId === ex.id) {
          const editor = makeInlineEditor({
            placeholder: "Exercise Sets/Reps/Weight",
            value: state.edit.draft,
            onCommit: commitEdit,
            onCancel: cancelEdit,
            compact:true,
            autocompleteExercise:true
          });
          wRow.appendChild(editor);
          focusTarget = editor;
          continue;
        }

        const exDiv = document.createElement("div");
        exDiv.className = "exerciseLine";
        const isCurrentExerciseRow = isCurrentExercise(w.id, ex.id);

        const top = document.createElement("div");
        top.className = "exerciseTop";
        if (isCurrentExerciseRow) top.classList.add("currentFocus");
        const name = document.createElement("span");
        name.className = "exerciseName";
        name.textContent = ex.name;
        top.appendChild(name);

        if (!isExpandedEx) {
          const summary = document.createElement("span");
          summary.className = "setsSummary";
          summary.textContent = summarizeSets(ex.sets);
          top.appendChild(summary);
        }
        if (isCurrentExerciseRow) {
          const spacer = document.createElement("div");
          spacer.className = "rowSpacer";

          top.appendChild(spacer);
          top.appendChild(makeDeleteButton(() => removeExercise(w, ex.id), { focusAddExercise:true }));
        }
        exDiv.appendChild(top);

        bindTapHandlers(exDiv, {
          onTap: () => {
            if (state.edit) return;
            const wasExpanded = state.expandedExerciseId === ex.id;
            if (wasExpanded) {
              state.expandedExerciseId = null;
              if (state.current &&
                  state.current.workoutId === w.id &&
                  (state.current.kind === "exercise" || state.current.kind === "set") &&
                  state.current.exerciseId === ex.id) {
                state.current = null;
              }
            } else {
              state.expandedExerciseId = ex.id;
              setCurrentExercise(w.id, ex.id);
            }
            save();
            render(wasExpanded ? { focusAddExercise:true } : { focusAddSet:true });
          },
          onDoubleTap: () => {
            if (state.edit) return;
            beginEditExercise(w, ex);
          }
        });

        if (isExpandedEx) {
          const setsBox = document.createElement("div");
          setsBox.className = "setsList";

          ex.sets.forEach((s, idx) => {
            if (state.edit && state.edit.kind === "set" &&
                state.edit.workoutId === w.id &&
                state.edit.exerciseId === ex.id &&
                state.edit.setIndex === idx) {
              const editor = makeInlineEditor({
                placeholder: "Set...",
                value: state.edit.draft,
                onCommit: commitEdit,
                onCancel: cancelEdit,
                compact:true
              });
              setsBox.appendChild(editor);
              focusTarget = editor;
              return;
            }

            const setLine = document.createElement("div");
            setLine.className = "setLine";
            if (s.invalid) setLine.classList.add("setInvalid");
            const isCurrentSetRow = isCurrentSet(w.id, ex.id, idx);
            if (isCurrentSetRow) setLine.classList.add("currentFocus");

            const setValue = document.createElement("span");
            setValue.className = "setValue";
            setValue.textContent = formatSetLine(s);
            setLine.appendChild(setValue);

            const spacer = document.createElement("span");
            spacer.className = "rowSpacer";
            setLine.appendChild(spacer);

            const actionSlot = document.createElement("span");
            actionSlot.className = "rowActionSlot";
            if (isCurrentSetRow) actionSlot.appendChild(makeDeleteButton(() => removeSet(w, ex, idx)));
            setLine.appendChild(actionSlot);

            bindTapHandlers(setLine, {
              onTap: () => {
                if (state.edit) return;
                setCurrentSet(w.id, ex.id, idx);
                save();
                render();
              },
              onDoubleTap: () => {
                if (state.edit) return;
                beginEditSet(w, ex, idx);
              }
            });

            setsBox.appendChild(setLine);
          });

          if (!state.edit) {
            const add = makeInlineEditor({
              placeholder: "Set...",
              value: "",
              onCommit: (txt) => commitAdd(txt),
              onCancel: () => {
                state.expandedExerciseId = null;
                setCurrentWorkout(w.id);
                save();
                render({ focusAddExercise:true });
              },
              compact:true,
              clearOnCancel:true
            });
            setsBox.appendChild(add);
            if (opts.focusAddSet && isExpandedEx) focusTarget = add;
          }

          exDiv.appendChild(setsBox);
        }

        wRow.appendChild(exDiv);
      }

      if (!state.edit && !state.expandedExerciseId) {
        const add = makeInlineEditor({
          placeholder: "Exercise...",
          value: "",
          onCommit: (txt) => commitAdd(txt),
          onCancel: () => {
            const prevWorkoutId = state.expandedWorkoutId;
            setScreenMain();
            if (prevWorkoutId) setCurrentWorkout(prevWorkoutId);
            save();
            render(prevWorkoutId ? { scrollToWorkoutId: prevWorkoutId } : undefined);
          },
          compact:true,
          clearOnCancel:true,
          autocompleteExercise:true
        });
        wRow.appendChild(add);
        if (opts.focusAddExercise) focusTarget = add;
      }

      elList.appendChild(wRow);
    }

    renderHistoryDrawer(activeWorkout);

    if (focusTarget && (opts.focusEdit || opts.focusAddExercise || opts.focusAddSet)) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (focusTarget && focusTarget._focus) focusTarget._focus();
        });
      });
    }

    if (opts.scrollBottom) {
      queueMicrotask(() => window.scrollTo(0, document.body.scrollHeight));
    }
    if (opts.scrollToWorkoutId) {
      queueMicrotask(() => {
        const target = elList.querySelector(`[data-workout-id="${opts.scrollToWorkoutId}"]`);
        if (target) target.scrollIntoView({ block: "center" });
      });
    }
  }

  if (elImportInput) {
    elImportInput.addEventListener("change", handleCsvImportInputChange);
  }
  if (elSettingsBtn) {
    elSettingsBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.screen !== "main") return;
      const nextOpen = !settingsMenuOpen;
      if (nextOpen && state.mainAddOpen) {
        state.mainAddOpen = false;
        setSettingsMenuOpen(true);
        render();
        return;
      }
      setSettingsMenuOpen(nextOpen);
    });
  }
  if (elAddWorkoutBtn) {
    elAddWorkoutBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.screen !== "main") return;
      state.mainAddOpen = !state.mainAddOpen;
      setSettingsMenuOpen(false);
      render({ focusEdit: state.mainAddOpen });
    });
  }
  if (elBackBtn) {
    elBackBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.screen !== "workout") return;
      const prevWorkoutId = state.expandedWorkoutId;
      setScreenMain();
      if (prevWorkoutId) setCurrentWorkout(prevWorkoutId);
      save();
      render(prevWorkoutId ? { scrollToWorkoutId: prevWorkoutId } : undefined);
    });
  }
  if (elHistoryTab) {
    elHistoryTab.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target instanceof Element ? ev.target : null;
      if (target && (target.closest(".historyFilterBtn") || target.closest(".historyMaxBtn"))) return;
      if (state.screen !== "workout") return;
      const activeWorkout = findWorkout(state.expandedWorkoutId);
      if (!activeWorkout) return;
      if (!getCurrentExerciseForHistory(activeWorkout)) return;
      state.historyOpen = !state.historyOpen;
      save();
      renderHistoryDrawer(activeWorkout);
    });
    elHistoryTab.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      const target = ev.target instanceof Element ? ev.target : null;
      if (target && target.closest("button, input, textarea, select")) return;
      ev.preventDefault();
      elHistoryTab.click();
    });
  }
  if (elHistoryFilterBtn) {
    elHistoryFilterBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.screen !== "workout" || !state.historyOpen) return;
      const activeWorkout = findWorkout(state.expandedWorkoutId);
      if (!activeWorkout) return;
      if (!getCurrentExerciseForHistory(activeWorkout)) return;

      if (state.historyFilterOpen) {
        state.historyFilterOpen = false;
        state.historyFilterWeight = "";
        state.historyFilterReps = "";
      } else {
        state.historyFilterOpen = true;
      }
      save();
      render();
    });
  }
  if (elHistoryWeightFilterInput) {
    elHistoryWeightFilterInput.addEventListener("input", () => {
      state.historyFilterWeight = elHistoryWeightFilterInput.value || "";
      const activeWorkout = findWorkout(state.expandedWorkoutId);
      renderHistoryDrawer(activeWorkout);
    });
  }
  if (elHistoryRepsFilterInput) {
    elHistoryRepsFilterInput.addEventListener("input", () => {
      state.historyFilterReps = elHistoryRepsFilterInput.value || "";
      const activeWorkout = findWorkout(state.expandedWorkoutId);
      renderHistoryDrawer(activeWorkout);
    });
  }
  if (elImportCsvBtn && elImportInput) {
    elImportCsvBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.screen !== "main") return;
      setDeleteAllConfirmOpen(false);
      elImportInput.click();
    });
  }
  if (elExportCsvBtn) {
    elExportCsvBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.screen !== "main") return;
      setDeleteAllConfirmOpen(false);

      const { rowCount, text } = buildExportCsvData();
      const filename = `workouts_export_${fmtDateDisplay(todayISO())}.csv`;
      downloadCsv(text, filename);
      setSettingsMenuOpen(false);
      showImportStatus(`Exported ${rowCount} rows.`, false);
    });
  }
  if (elFontSizeSlider) {
    elFontSizeSlider.addEventListener("input", () => {
      state.fontSizePt = clampFontPt(elFontSizeSlider.value);
      applyFontSize();
      save();
    });
  }
  if (elDeleteAllBtn) {
    elDeleteAllBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (state.screen !== "main") return;
      setDeleteAllConfirmOpen(true);
    });
  }
  if (elDeleteConfirmOkBtn) {
    elDeleteConfirmOkBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      removeAllWorkouts();
      save();
      render();
      showImportStatus("Deleted all workouts.");
      setSettingsMenuOpen(false);
    });
  }
  if (elDeleteConfirmCancelBtn) {
    elDeleteConfirmCancelBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      setDeleteAllConfirmOpen(false);
    });
  }
  document.addEventListener("pointerup", (ev) => {
    if (!settingsMenuOpen) return;
    const target = ev.target instanceof Element ? ev.target : null;
    if (!target) return;
    if (target.closest(".titleBar")) return;
    setSettingsMenuOpen(false);
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && settingsMenuOpen) {
      setSettingsMenuOpen(false);
      return;
    }
    if (ev.key === "Escape" && state.screen === "main" && state.mainAddOpen && !state.edit) {
      state.mainAddOpen = false;
      render();
    }
  });

  registerPwaServiceWorker();
  load();
  buildThemeOptions();
  applyAppearance();
  render();
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.body.classList.remove("boot");
    }, 460);
  });

})();
