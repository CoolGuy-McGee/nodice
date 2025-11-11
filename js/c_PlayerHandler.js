// js/c_PlayerHandler.js
export default class c_PlayerHandler {
  constructor(opts = {}) {
    this.maxPlayers = Number.isFinite(opts.maxPlayers) ? opts.maxPlayers : 2;
    this.requestedPlayers = Number.isFinite(opts.requestedPlayers) ? opts.requestedPlayers : this.maxPlayers;

    // Base palette in requested order.
    this._base = [
      { name: "blue",   bg: "#1e90ff", fg: "#ffffff", border: "#0f5fb3" },
      { name: "green",  bg: "#26a269", fg: "#ffffff", border: "#19744b" },
      { name: "pink",   bg: "#ff5fa2", fg: "#ffffff", border: "#b63a6d" },
      { name: "orange", bg: "#ff7a00", fg: "#1a1a1a", border: "#b35600" },
    ];

    this._players = [];
    this._active = 0;

    this._container = null;
    this._$ = (sel) => (typeof sel === "string" ? document.querySelector(sel) : sel);

    // For optional per-turn tracking if you decide to patch hooks later.
    this._pendingTurnScore = 0;
    this._pendingHighestRoll = 0;
  }

  // ----- public API -----

  /** Mounts the UI and (optionally) creates players now */
  _attach(containerSelector = "#players", createNow = true) {
    this._container = this._$(containerSelector);
    if (!this._container) {
      this._container = document.createElement("div");
      this._container.id = "players";
      document.body.prepend(this._container);
    }
    if (createNow) this._initPlayers(this.requestedPlayers);
  }

  /** Create N players, clamped by maxPlayers */
  _initPlayers(n) {
    const count = Math.max(1, Math.min(this.maxPlayers, Math.floor(n || 1)));
    this._players = [];
    for (let i = 0; i < count; i++) this._players.push(this._createDefaultPlayer(i));
    this._active = 0;
    this._render();
  }

  /** Returns active player object */
  _getActivePlayer() { return this._players[this._active]; }

  /** Advances active player (round-robin) */
  _nextPlayer() {
    if (!this._players.length) return;
    this._active = (this._active + 1) % this._players.length;
    this._render();
  }

  /** Records a final turn result for a given player index */
  _recordTurn(playerIndex, turnScore, highestSingleRollScore = 0) {
    const p = this._players[playerIndex];
    if (!p) return;
    const add = Math.max(0, Math.floor(turnScore || 0));
    const hi  = Math.max(0, Math.floor(highestSingleRollScore || 0));
    p.totalScore += add;
    p.highestDiceScore = Math.max(p.highestDiceScore, hi);
    this._render();
  }

  /** If you want to track while playing a turn (optional helper) */
  _recordProvisionalRoll(rollScore) {
    if (!Number.isFinite(rollScore)) return;
    this._pendingHighestRoll = Math.max(this._pendingHighestRoll, rollScore);
  }
  _commitPendingTurn(finalTurnScore) {
    this._recordTurn(this._active, finalTurnScore, this._pendingHighestRoll);
    this._pendingHighestRoll = 0;
    this._pendingTurnScore = 0;
  }

  // ----- internals -----

  _createDefaultPlayer(idx) {
    const palette = this._colorForIndex(idx);
    return {
      id: idx,
      name: `Player ${idx + 1}`,
      color: palette,          // {bg, fg, border, name}
      totalScore: 0,
      highestDiceScore: 0
    };
  }

  _colorForIndex(idx) {
    if (idx < this._base.length) return this._base[idx];
    // For 5th+ players: mix by cycling base + vary lightness
    const base = this._base[idx % this._base.length];
    const step = 6 + (idx - this._base.length) * 6; // gentle lightening
    const adj = this._adjustColor(base.bg, step);
    return { name: base.name + "+" + (idx - 3), bg: adj.bg, fg: adj.fg, border: adj.border };
  }

  _adjustColor(hex, lighten = 8) {
    const toRGB = (h) => {
      const m = /^#?([0-9a-f]{6})$/i.exec(h);
      const n = parseInt(m[1], 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };
    const clamp = (x) => Math.max(0, Math.min(255, x));
    const { r, g, b } = toRGB(hex);
    const nr = clamp(r + lighten), ng = clamp(g + lighten), nb = clamp(b + lighten);
    const toHex = (x) => x.toString(16).padStart(2, "0");
    const bg = `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
    // Simple contrast pick:
    const luma = 0.2126*nr + 0.7152*ng + 0.0722*nb;
    const fg = luma > 170 ? "#1a1a1a" : "#ffffff";
    const border = `#${toHex(clamp(nr-40))}${toHex(clamp(ng-40))}${toHex(clamp(nb-40))}`;
    return { bg, fg, border };
  }

  _render() {
    if (!this._container) return;
    this._container.innerHTML = "";
    this._container.classList.add("players-wrap");

    for (let i = 0; i < this._players.length; i++) {
      const p = this._players[i];
      const card = document.createElement("div");
      card.className = "player-card";
      card.dataset.idx = String(i);
      card.style.setProperty("--pc-bg", p.color.bg);
      card.style.setProperty("--pc-fg", p.color.fg);
      card.style.setProperty("--pc-border", p.color.border);
      card.style.setProperty("--pc-active", i === this._active ? "1" : "0");

      card.innerHTML = `
        <header class="player-head">
          <span class="dot"></span>
          <strong class="player-name">${p.name}</strong>
          ${i === this._active ? '<span class="active-tag" aria-label="Active">●</span>' : ""}
        </header>
        <div class="player-body">
          <div class="row">
            <div class="label">Total</div>
            <div class="value" data-field="total">${p.totalScore}</div>
          </div>
          <div class="row">
            <div class="label">Highest Dice</div>
            <div class="value" data-field="highest">${p.highestDiceScore}</div>
          </div>
        </div>
      `;
      this._container.appendChild(card);
    }
  }
}