/* ══════════════════════════════════════════
   ကိုးနဝင်း ဂုဏ်တော်ပုတီး — app.js
   All logic, state management, and UI rendering
══════════════════════════════════════════ */

"use strict";

// ─────────────────────────────────────────
// 1. CONSTANTS & DATA
// ─────────────────────────────────────────

/** The nine Buddha Gunas, indexed 1–9. */
const GUNAS = {
  1: "အရဟံ",
  2: "သမ္မာသမ္ဗုဒ္ဒေါ",
  3: "ဝိဇ္ဇာစရဏ သမ္ပန္နော",
  4: "သုဂတော",
  5: "လောကဝိဒူ",
  6: "အနုတ္တရော ပုရိသဒမ္မသာရထိ",
  7: "သတ္တာ ဒေဝမနုဿာနံ",
  8: "ဗုဒ္ဓေါ",
  9: "ဘဂဝါ",
};

/**
 * The base sequence of Guna IDs for Stage 1.
 * Day 1 → Guna 2 (2 rounds), Day 2 → Guna 9 (9 rounds), …
 */
const BASE_SEQUENCE = [2, 9, 4, 7, 5, 3, 6, 1, 8];

/**
 * Weekday names in Burmese (0=Sunday … 6=Saturday, matching JS Date).
 */
const WEEKDAYS_MY = [
  "တနင်္ဂနွေ",   // 0 Sunday
  "တနင်္လာ",     // 1 Monday
  "အင်္ဂါ",      // 2 Tuesday
  "ဗုဒ္ဓဟူး",    // 3 Wednesday
  "ကြာသပတေး",   // 4 Thursday
  "သောကြာ",      // 5 Friday
  "စနေ",         // 6 Saturday
];

/**
 * Each stage starts on a fixed weekday (JS 0=Sun … 6=Sat).
 * Stage 1 → Monday(1), Stage 2 → Wednesday(3), Stage 3 → Friday(5),
 * Stage 4 → Sunday(0), Stage 5 → Tuesday(2), Stage 6 → Thursday(4),
 * Stage 7 → Saturday(6), Stage 8 → Monday(1), Stage 9 → Wednesday(3)
 * Pattern: Monday(1) +2 each stage, wrapping mod 7.
 */
const STAGE_START_WEEKDAY = [1, 3, 5, 0, 2, 4, 6, 1, 3]; // index = stage-1

/** Return the Burmese weekday name for a given stage & day-in-stage (1–9). */
function getWeekdayName(stage, day) {
  const start = STAGE_START_WEEKDAY[stage - 1];
  return WEEKDAYS_MY[(start + (day - 1)) % 7];
}

/**
 * Stage milestone blessings (shown on stage-complete screen).
 */
const MILESTONES = {
  1: {
    title: "အဆင့် ၁ — ကျေးဇူးတော်",
    text: "ပထမအဆင့် ပြီးစီးပါပြီ။ ဘုရားဂုဏ်တော် (သမ္မာသမ္ဗုဒ္ဒေါ) မှ စတင်ကာ ၉ ရက် မပျက်မကွက် ဆင်ခြင်ပြီးပါပြီ။ ကောင်းမှုကုသိုလ် ဖြစ်ပွားကာ ကြုပ်သောကံများ ဖျောက်ဖျက်ပေးမည်ဟု ယုံကြည်ပါ။",
  },
  2: {
    title: "အဆင့် ၂ — ကျေးဇူးတော်",
    text: "ဒုတိယအဆင့် ပြီးစီးပါပြီ။ ပညာဉာဏ် တိုးပွားလာမည်ဟု ဆိုသည်။ မိမိ၏ ဒေါသ၊ ငြိုငြင်မှုများ လျော့ပါးသွားကာ စိတ်ငြိမ်ဝပ်မှု ရရှိလာပါမည်။",
  },
  3: {
    title: "အဆင့် ၃ — ကျေးဇူးတော်",
    text: "တတိယအဆင့် ပြီးစီးပါပြီ။ ဘုရားဂုဏ်တော် (ဝိဇ္ဇာစရဏ) ကိုး ရက် ဆင်ခြင်ပြီးသောကြောင့် သင်၏ ကိုယ်ကျင့်တရားနှင့် ပညာ ကြီးထွားမည်ဟု ဆိုသည်။",
  },
  4: {
    title: "အဆင့် ၄ — ကျေးဇူးတော်",
    text: "စတုတ္ထအဆင့် ပြီးစီးပါပြီ။ ကျန်းမာရေး နှင့် ဆင်းရဲဒုက္ခများ ကင်းဝေးမည့် ဗုဒ္ဓ ကာကွယ်မှုကို ရရှိနေပြီဖြစ်သည်။",
  },
  5: {
    title: "အဆင့် ၅ — ကျေးဇူးတော်",
    text: "ပဉ္စမအဆင့် ပြီးစီးပါပြီ။ ကိုးနဝင်းပတ်လည်၏ အလယ်တည့်တည့် ရောက်ရှိနေပြီ။ သင်၏ ကြိုးစားမှု ဘုရားဗဟုဂုဏ်ကို ဝင်ရောက်နေပြီဖြစ်သည်ဟု ဆိုသည်။",
  },
  6: {
    title: "အဆင့် ၆ — ကျေးဇူးတော်",
    text: "ဆဋ္ဌမအဆင့် ပြီးစီးပါပြီ။ ဘဝတွင် မေတ္တာ၊ ကရုဏာ တိုးပွားကာ ပတ်ဝန်းကျင်နှင့် ပြေလည်မှုများ ဖြစ်ပေါ်မည်ဟု ဆိုသည်။",
  },
  7: {
    title: "အဆင့် ၇ — ကျေးဇူးတော်",
    text: "သတ္တမအဆင့် ပြီးစီးပါပြီ။ သတ္တဝါ အားလုံးအတွက် မေတ္တာပို့ပြီး ဆင်ခြင်ခဲ့သောကြောင့် ကုသိုလ်ကံ ပြည့်ဝနေပြီ ဖြစ်သည်ဟု ဆိုသည်။",
  },
  8: {
    title: "အဆင့် ၈ — ကျေးဇူးတော်",
    text: "အဋ္ဌမအဆင့် ပြီးစီးပါပြီ။ ၇၂ ရက် ပြည့်မြောက်ပြီ ဖြစ်သည်။ မဂ်ဖိုလ်ဆီ ဦးတည်သော ကုသိုလ်ကံ ပြင်းထန်နေပြီဟု ဆိုသည်။",
  },
  9: {
    title: "ကိုးနဝင်း ပြည့်မြောက်! 🎊",
    text: "ကိုးနဝင်းပုတီးအဓိဌာန် ၈၁ ရက် ပြည့်မြောက်ပါပြီ! ဘုရားဂုဏ်တော် ကိုးပါးကို မပျက်မကွက် ဆင်ခြင်ပြီးသောကြောင့် ဘုရားသခင်၏ ကာကွယ်မှု၊ ချမ်းသာသုခ၊ နှင့် မဂ်ဖိုလ်နိဗ္ဗာန် ဆီ ဦးတည်မှုကို ရရှိပါစေ။",
  },
};

// ─────────────────────────────────────────
// 2. STATE & PERSISTENCE
// ─────────────────────────────────────────

const STORAGE_KEY = "ko_nawin_state_v1";

/**
 * @typedef {Object} AppState
 * @property {number} stage   - 1–9
 * @property {number} day     - 1–9
 * @property {boolean} setup  - whether initial setup is done
 */

/** Load state from localStorage, or return null. */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Persist state to localStorage. */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — gracefully ignore
  }
}

/** Clear persisted state. */
function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ─────────────────────────────────────────
// 3. CORE LOGIC
// ─────────────────────────────────────────

/**
 * Given a stage (1–9) and day (1–9, 1-indexed),
 * return { gunaId, gunaName, rounds }.
 *
 * Formula:
 *   base_guna_id = BASE_SEQUENCE[day - 1]
 *   rounds       = base_guna_id + (stage - 1)
 *   if rounds > 9, rounds -= 9
 *   gunaId       = rounds   (same as rounds, since guna IDs == rounds)
 */
function getDayInfo(stage, day) {
  const baseId = BASE_SEQUENCE[day - 1];
  let rounds = baseId + (stage - 1);
  if (rounds > 9) rounds -= 9;
  const gunaId = rounds;
  return {
    gunaId,
    gunaName: GUNAS[gunaId],
    rounds,
  };
}

/**
 * Build the full 9-day schedule for a given stage.
 * Returns array of { day, gunaId, gunaName, rounds }.
 */
function buildStageSchedule(stage) {
  return Array.from({ length: 9 }, (_, i) => {
    const d = i + 1;
    const info = getDayInfo(stage, d);
    return { day: d, ...info };
  });
}

// ─────────────────────────────────────────
// 4. SCREEN MANAGEMENT
// ─────────────────────────────────────────

const screens = {
  intro:    document.getElementById("screen-intro"),
  setup:    document.getElementById("screen-setup"),
  tracker:  document.getElementById("screen-tracker"),
  complete: document.getElementById("screen-complete"),
  alldone:  document.getElementById("screen-alldone"),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  if (screens[name]) screens[name].classList.add("active");
}

// ─────────────────────────────────────────
// 5. INTRO SCREEN
// ─────────────────────────────────────────

document.getElementById("btn-start").addEventListener("click", () => {
  showScreen("setup");
});

// ─────────────────────────────────────────
// 6. SETUP SCREEN
// ─────────────────────────────────────────

let setupStage = 1;
let setupDay   = 1;

function updateSetupDisplay() {
  document.getElementById("val-stage").textContent = setupStage;
  // Show weekday name for the selected day within the selected stage
  document.getElementById("val-day").textContent   = getWeekdayName(setupStage, setupDay);
}

document.getElementById("btn-back-to-intro").addEventListener("click", () => {
  showScreen("intro");
});

document.querySelectorAll(".picker-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    const target = btn.dataset.target;

    if (target === "stage") {
      setupStage = action === "inc"
        ? Math.min(9, setupStage + 1)
        : Math.max(1, setupStage - 1);
    } else {
      setupDay = action === "inc"
        ? Math.min(9, setupDay + 1)
        : Math.max(1, setupDay - 1);
    }
    updateSetupDisplay();
  });
});

document.getElementById("btn-confirm-setup").addEventListener("click", () => {
  const state = { stage: setupStage, day: setupDay, setup: true };
  saveState(state);
  renderTracker(state.stage, state.day);
  showScreen("tracker");
});

// ─────────────────────────────────────────
// 7. TRACKER SCREEN
// ─────────────────────────────────────────

function renderTracker(stage, day) {
  const info = getDayInfo(stage, day);

  // Header labels
  document.getElementById("lbl-stage").textContent   = `အဆင့် ${stage}`;
  document.getElementById("lbl-day").textContent     = getWeekdayName(stage, day);

  // Day dots — show weekday abbreviation below each dot
  const dotsEl = document.getElementById("day-dots");
  dotsEl.innerHTML = "";
  for (let d = 1; d <= 9; d++) {
    const wrap = document.createElement("div");
    wrap.className = "day-dot-wrap";

    const dot = document.createElement("div");
    dot.className = "day-dot";
    if (d < day)   dot.classList.add("done");
    if (d === day) dot.classList.add("current");

    const lbl = document.createElement("span");
    lbl.className = "day-dot-lbl";
    // Short 2-char abbreviation from first 2 chars of weekday
    lbl.textContent = getWeekdayName(stage, d).slice(0, 2);
    if (d === day) lbl.classList.add("dot-lbl-active");

    wrap.appendChild(dot);
    wrap.appendChild(lbl);
    dotsEl.appendChild(wrap);
  }

  // Guna name & rounds
  document.getElementById("guna-name").textContent    = info.gunaName;
  document.getElementById("rounds-number").textContent = info.rounds;

  // Bead row
  const beadRow = document.getElementById("bead-row");
  beadRow.innerHTML = "";
  for (let i = 0; i < info.rounds; i++) {
    const bead = document.createElement("div");
    bead.className = "bead";
    bead.style.animationDelay = `${i * 60}ms`;
    beadRow.appendChild(bead);
  }

  // Schedule strip
  const schedule = buildStageSchedule(stage);
  const listEl   = document.getElementById("schedule-list");
  listEl.innerHTML = "";
  schedule.forEach(item => {
    const el = document.createElement("div");
    el.className = "schedule-item";
    if (item.day === day)  el.classList.add("active-day");

    const dayLbl = document.createElement("span");
    dayLbl.className = "sched-day";
    dayLbl.textContent = getWeekdayName(stage, item.day);

    const rndLbl = document.createElement("span");
    rndLbl.className = "sched-rounds";
    if (item.day < day) rndLbl.classList.add("sched-done");
    rndLbl.textContent = `${item.rounds} ကြိမ်`;

    el.appendChild(dayLbl);
    el.appendChild(rndLbl);
    listEl.appendChild(el);
  });
}

document.getElementById("btn-complete").addEventListener("click", () => {
  const state = loadState();
  if (!state) return;

  if (state.day < 9) {
    // Advance to next day
    state.day++;
    saveState(state);
    renderTracker(state.stage, state.day);
  } else {
    // Stage complete
    showStageComplete(state.stage);
  }
});

document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("ပုတီးအဓိဌာန်ကို ပြန်လည် သတ်မှတ်မည်လား?")) {
    clearState();
    setupStage = 1;
    setupDay   = 1;
    updateSetupDisplay();
    showScreen("setup");
  }
});

// ─────────────────────────────────────────
// 8. STAGE COMPLETE SCREEN
// ─────────────────────────────────────────

function showStageComplete(stage) {
  const milestone = MILESTONES[stage] || MILESTONES[1];

  document.getElementById("complete-stage-label").textContent =
    `အဆင့် ${stage} ပြီးစီးပါပြီ`;

  const card = document.getElementById("milestone-card");
  card.innerHTML = `
    <h3>${milestone.title}</h3>
    <p>${milestone.text}</p>
  `;

  const btnNext = document.getElementById("btn-next-stage");
  const btnDone = document.getElementById("btn-done-all");

  if (stage >= 9) {
    btnNext.style.display = "none";
    btnDone.style.display = "block";
  } else {
    btnNext.style.display = "block";
    btnDone.style.display = "none";
  }

  showScreen("complete");
}

document.getElementById("btn-next-stage").addEventListener("click", () => {
  const state = loadState();
  if (!state) return;
  const newStage = state.stage + 1;
  const newState = { stage: newStage, day: 1, setup: true };
  saveState(newState);
  renderTracker(newState.stage, newState.day);
  showScreen("tracker");
});

document.getElementById("btn-done-all").addEventListener("click", () => {
  showScreen("alldone");
});

// ─────────────────────────────────────────
// 9. ALL-DONE SCREEN
// ─────────────────────────────────────────

document.getElementById("btn-restart").addEventListener("click", () => {
  clearState();
  setupStage = 1;
  setupDay   = 1;
  updateSetupDisplay();
  showScreen("setup");
});

// ─────────────────────────────────────────
// 10. BOOT
// ─────────────────────────────────────────

(function boot() {
  const saved = loadState();
  if (saved && saved.setup) {
    renderTracker(saved.stage, saved.day);
    showScreen("tracker");
  } else {
    showScreen("intro");
  }
})();
