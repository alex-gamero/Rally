/* Rally — ad-free volleyball scoreboard (PWA) */
(() => {
  "use strict";

  const STORAGE_KEY = "rally:v1";
  const MAX_HISTORY = 150;
  const COLORS = ["#ff5a36", "#22d3ee", "#a3e635", "#fbbf24", "#a78bfa", "#f472b6", "#3b82f6", "#f4f4f2"];

  const defaults = () => ({
    teams: [
      { name: "HOME", color: COLORS[0] },
      { name: "AWAY", color: COLORS[1] },
    ],
    settings: {
      bestOf: 5,
      points: 25,
      tiebreak: 15,
      winBy2: true,
      autoSwap: true,
      vibrate: true,
      wakeLock: true,
    },
    game: freshGame(),
    history: [],
  });

  function freshGame() {
    return {
      score: [0, 0],
      sets: [0, 0],
      setHistory: [],   // [{ a, b, winner }]
      serving: null,    // 0 | 1 | null
      pendingSet: null, // winner index while the "set won" card is showing
      matchOver: false,
      swapped: false,
      tbSwitched: false, // already switched sides at 8 in the deciding set
    };
  }

  // ---------- State ----------
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults();
      const saved = JSON.parse(raw);
      const d = defaults();
      return {
        teams: saved.teams || d.teams,
        settings: { ...d.settings, ...(saved.settings || {}) },
        game: { ...d.game, ...(saved.game || {}) },
        history: Array.isArray(saved.history) ? saved.history : [],
      };
    } catch {
      return defaults();
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }

  function snapshot() {
    state.history.push(JSON.stringify(state.game));
    if (state.history.length > MAX_HISTORY) state.history.shift();
  }

  // ---------- Rules ----------
  const other = (i) => 1 - i;
  const setsToWin = () => Math.ceil(state.settings.bestOf / 2);
  const currentSetNo = () => state.game.sets[0] + state.game.sets[1] + 1;
  const isDecider = () => state.settings.bestOf > 1 && currentSetNo() === state.settings.bestOf;
  const target = () => (isDecider() ? state.settings.tiebreak : state.settings.points);

  function wins(own, opp) {
    if (own < target()) return false;
    return state.settings.winBy2 ? own - opp >= 2 : true;
  }

  // ---------- Actions ----------
  function addPoint(i) {
    const g = state.game;
    if (g.pendingSet !== null || g.matchOver) return;
    snapshot();
    g.score[i]++;
    g.serving = i;
    buzz(15);
    flash(i, "flash");

    if (wins(g.score[i], g.score[other(i)])) {
      g.pendingSet = i;
      g.setHistory.push({ a: g.score[0], b: g.score[1], winner: i });
      g.sets[i]++;
      if (g.sets[i] >= setsToWin()) g.matchOver = true;
      buzz([40, 60, 140]);
    } else if (isDecider() && !g.tbSwitched && g.score[i] === Math.ceil(target() / 2)) {
      // Switch sides when the leading team reaches 8 in a set to 15
      g.tbSwitched = true;
      if (state.settings.autoSwap) g.swapped = !g.swapped;
      toast("SWITCH SIDES");
      buzz([30, 50, 30]);
    }
    commit({ bump: i });
  }

  function removePoint(i) {
    const g = state.game;
    if (g.pendingSet !== null || g.matchOver || g.score[i] === 0) return;
    snapshot();
    g.score[i]--;
    buzz([10, 40, 10]);
    flash(i, "flash-minus");
    commit({ bump: i });
  }

  function setServe(i) {
    const g = state.game;
    if (g.serving === i) return;
    snapshot();
    g.serving = i;
    buzz(10);
    commit();
  }

  function nextSet() {
    const g = state.game;
    if (g.pendingSet === null) return;
    snapshot();
    const winner = g.pendingSet;
    g.pendingSet = null;
    g.score = [0, 0];
    g.tbSwitched = false;
    g.serving = other(winner); // loser of the set serves first in the next one (common rec rule)
    if (state.settings.autoSwap) g.swapped = !g.swapped;
    commit();
  }

  function undo() {
    const prev = state.history.pop();
    if (!prev) return;
    state.game = JSON.parse(prev);
    buzz(8);
    commit();
  }

  function swapSides() {
    snapshot();
    state.game.swapped = !state.game.swapped;
    buzz(10);
    commit();
  }

  function resetSet() {
    const g = state.game;
    snapshot();
    g.score = [0, 0];
    g.pendingSet = null;
    g.tbSwitched = false;
    commit();
  }

  function newMatch() {
    snapshot(); // still undoable, just in case
    const swapped = state.game.swapped;
    state.game = freshGame();
    state.game.swapped = swapped;
    commit();
  }

  function commit(opts = {}) {
    save();
    render(opts);
  }

  // ---------- Rendering ----------
  const $ = (id) => document.getElementById(id);
  const board = $("board");

  function render({ bump } = {}) {
    const { game: g, teams } = state;
    let matchPoint = false;
    const root = document.documentElement.style;
    root.setProperty("--c0", teams[0].color);
    root.setProperty("--c1", teams[1].color);

    board.classList.toggle("swapped", g.swapped);

    for (const i of [0, 1]) {
      $("name" + i).textContent = teams[i].name || (i ? "AWAY" : "HOME");
      const sc = $("score" + i);
      sc.textContent = g.score[i];
      if (bump === i) {
        sc.classList.remove("bump");
        void sc.offsetWidth;
        sc.classList.add("bump");
      }
      $("panel" + i).classList.toggle("serving", g.serving === i);

      const badge = $("badge" + i);
      let label = "";
      if (g.pendingSet === null && !g.matchOver && wins(g.score[i] + 1, g.score[other(i)])) {
        label = g.sets[i] + 1 >= setsToWin() ? "MATCH POINT" : "SET POINT";
      }
      badge.textContent = label || "·";
      badge.classList.toggle("on", !!label);
      badge.classList.toggle("match", label === "MATCH POINT");
      if (label === "MATCH POINT") matchPoint = true;
    }

    $("setsA").textContent = g.sets[0];
    $("setsB").textContent = g.sets[1];

    const setNo = Math.min(currentSetNo(), state.settings.bestOf);
    $("setLabel").classList.toggle("match", matchPoint);
    $("setLabel").textContent = matchPoint
      ? "MATCH POINT"
      : g.matchOver
      ? "FINAL"
      : g.pendingSet !== null
      ? `SET ${g.setHistory.length} DONE`
      : state.settings.bestOf === 1
      ? `TO ${target()}`
      : isDecider()
      ? `SET ${setNo} · DECIDER`
      : `SET ${setNo}`;

    $("setHistory").innerHTML = g.setHistory
      .map((s) => `<span class="w${s.winner}">${g.swapped ? s.b : s.a}–${g.swapped ? s.a : s.b}</span>`)
      .join("");

    $("btnUndo").disabled = state.history.length === 0;

    // Win card
    const overlay = $("winOverlay");
    if (g.pendingSet !== null) {
      const w = g.pendingSet;
      const card = overlay.querySelector(".win-card");
      card.style.setProperty("--c", teams[w].color);
      $("winTitle").textContent = teams[w].name;
      if (g.matchOver) {
        $("winKicker").textContent = "WINS THE MATCH";
        $("winScore").textContent =
          state.settings.bestOf === 1
            ? `${g.score[w]} – ${g.score[other(w)]}`
            : `${g.sets[w]} – ${g.sets[other(w)]}`;
        $("winNext").textContent = "New match";
      } else {
        $("winKicker").textContent = `TAKES SET ${g.setHistory.length}`;
        $("winScore").textContent = `${g.score[w]} – ${g.score[other(w)]}`;
        $("winNext").textContent = "Next set";
      }
      overlay.hidden = false;
    } else {
      overlay.hidden = true;
    }
  }

  function flash(i, cls) {
    const p = $("panel" + i);
    p.classList.remove("flash", "flash-minus");
    void p.offsetWidth;
    p.classList.add(cls);
  }

  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function buzz(pattern) {
    if (state.settings.vibrate && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch { /* ignore */ }
    }
  }

  // ---------- Input: tap = +1, swipe down = −1 ----------
  for (const i of [0, 1]) {
    const panel = $("panel" + i);
    let start = null;

    panel.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".serve-btn")) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    });
    panel.addEventListener("pointerup", (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (dy > 50 && Math.abs(dy) > Math.abs(dx)) removePoint(i);
      else if (Math.hypot(dx, dy) < 25) addPoint(i);
    });
    panel.addEventListener("pointercancel", () => (start = null));
    panel.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  document.querySelectorAll(".serve-btn").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      setServe(Number(b.dataset.serve));
    })
  );

  $("btnUndo").addEventListener("click", undo);
  $("btnSwap").addEventListener("click", swapSides);
  $("btnReset").addEventListener("click", () => openSheet("resetSheet"));
  $("btnSettings").addEventListener("click", () => openSheet("settingsSheet"));

  $("winUndo").addEventListener("click", undo);
  $("winNext").addEventListener("click", () => (state.game.matchOver ? newMatch() : nextSet()));

  $("resetSet").addEventListener("click", () => { resetSet(); closeSheets(); toast("SET RESET"); });
  $("resetMatch").addEventListener("click", () => { newMatch(); closeSheets(); toast("NEW MATCH"); });

  // ---------- Sheets ----------
  function openSheet(id) {
    if (id === "settingsSheet") syncSettingsUI();
    $(id).hidden = false;
  }
  function closeSheets() {
    document.querySelectorAll(".sheet-backdrop").forEach((s) => (s.hidden = true));
    if (document.activeElement) document.activeElement.blur();
  }
  document.querySelectorAll(".sheet-backdrop").forEach((bd) => {
    bd.addEventListener("click", (e) => {
      if (e.target === bd || e.target.closest("[data-close]")) closeSheets();
    });
  });

  // ---------- Settings UI ----------
  document.querySelectorAll(".swatches").forEach((wrap) => {
    const team = Number(wrap.dataset.team);
    wrap.innerHTML = COLORS.map(
      (c) => `<button class="swatch" style="--sw:${c}" data-color="${c}" aria-label="Color ${c}"></button>`
    ).join("");
    wrap.addEventListener("click", (e) => {
      const b = e.target.closest(".swatch");
      if (!b) return;
      state.teams[team].color = b.dataset.color;
      commit();
      syncSettingsUI();
    });
  });

  for (const i of [0, 1]) {
    $("inName" + i).addEventListener("input", (e) => {
      state.teams[i].name = e.target.value.toUpperCase().trim() || (i ? "AWAY" : "HOME");
      commit();
    });
    $("inName" + i).addEventListener("keydown", (e) => { if (e.key === "Enter") e.target.blur(); });
  }

  document.querySelectorAll(".seg").forEach((seg) => {
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      state.settings[seg.dataset.setting] = Number(b.dataset.v);
      commit();
      syncSettingsUI();
    });
  });

  document.querySelectorAll('input[type="checkbox"][data-setting]').forEach((cb) => {
    cb.addEventListener("change", () => {
      state.settings[cb.dataset.setting] = cb.checked;
      commit();
      if (cb.dataset.setting === "wakeLock") updateWakeLock();
    });
  });

  function syncSettingsUI() {
    for (const i of [0, 1]) {
      const input = $("inName" + i);
      if (document.activeElement !== input) input.value = state.teams[i].name;
      document.querySelectorAll(`.swatches[data-team="${i}"] .swatch`).forEach((s) =>
        s.classList.toggle("on", s.dataset.color === state.teams[i].color)
      );
    }
    document.querySelectorAll(".seg").forEach((seg) => {
      const v = state.settings[seg.dataset.setting];
      seg.querySelectorAll("button").forEach((b) => b.classList.toggle("on", Number(b.dataset.v) === v));
    });
    document.querySelectorAll('input[type="checkbox"][data-setting]').forEach((cb) => {
      cb.checked = !!state.settings[cb.dataset.setting];
    });
  }

  // ---------- Keep screen awake ----------
  let wakeLock = null;
  async function updateWakeLock() {
    try {
      if (state.settings.wakeLock && document.visibilityState === "visible" && "wakeLock" in navigator) {
        if (!wakeLock) {
          wakeLock = await navigator.wakeLock.request("screen");
          wakeLock.addEventListener("release", () => (wakeLock = null));
        }
      } else if (wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
    } catch { /* not supported or denied */ }
  }
  document.addEventListener("visibilitychange", updateWakeLock);
  document.addEventListener("pointerdown", updateWakeLock, { once: true });

  // ---------- Landscape only ----------
  function lockLandscape() {
    try { screen.orientation.lock("landscape").catch(() => {}); } catch { /* not supported */ }
  }
  lockLandscape();
  document.addEventListener("pointerdown", lockLandscape, { once: true });

  // ---------- Offline support ----------
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  render();
  updateWakeLock();
})();
