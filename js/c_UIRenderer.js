export default class c_UIRenderer {
    constructor() {
        this.containerDice = document.getElementById("dice-container");
        this.containerScore = document.getElementById("score");
        this.containerRunScore = document.getElementById("runscore");
        this.containerTotalScore = document.getElementById("totalscore");
        this.containerMessage = document.getElementById("message");
        this.buttonRoll = document.getElementById("roll-btn");
        this.buttonBank = document.getElementById("bank-btn");
        this.buttonEndTurn = document.getElementById("endturn-btn");
        this.buttonSelectAll = document.getElementById("select-all-btn");

        // toggle: show/hide the bottom info box (default true)
        this.showInfoBox = true;

        this._lastMessage = "";
        this.winModal = document.getElementById("win-modal");
        this.winModalExit = this.winModal
            ? this.winModal.querySelector("#exit")
            : null;
        this.winModalButtons = this.winModal
            ? Array.from(this.winModal.querySelectorAll("#buttonGrid .end-button"))
            : [];

        this._wireWinModalButtons();
    }

    _wireWinModalButtons() {
        if (!this.winModal) return;

        const close = () => this._closeWinModal();

        if (this.winModalExit) {
            this.winModalExit.addEventListener("click", close);
        }

        if (this.winModalButtons && this.winModalButtons.length) {
            this.winModalButtons.forEach((btn) => {
                const label = (btn.textContent || "").trim().toLowerCase();

                if (label.startsWith("new game")) {
                    btn.addEventListener("click", () => {
                        close();
                        // simplest version: full reset
                        window.location.reload();
                    });
                } else if (label.startsWith("settings")) {
                    btn.addEventListener("click", () => {
                        close();
                        // hook your settings modal / page here
                    });
                } else {
                    // "Rick Roll Yourself" (or any other fun button)
                    btn.addEventListener("click", () => {
                        close();
                        window.open(
                            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            "_blank",
                            "noopener"
                        );
                    });
                }
            });
        }
    }


    _getDiceImg() {
        const byId = [];
        for (let i = 1; i <= 6; i++) {
            const dien = document.getElementsByClassName('dice-display')[i];
            if (dien) byId.push(dien);
        }
        if (byId.length === 6) return byId;

        if (!this.containerDice) return [];
        return Array.from(this.containerDice.querySelectorAll(".dice-display"));
    }

    _renderDiceLabels(diceValues, selectedMask, bankedMask) {
        const diceImg = this._getDiceImg();
        for (let i = 0; i < diceImg.length && i < diceValues.length; i++) {
            const isSelected = !!selectedMask[i];
            const isBanked = !!bankedMask[i];
            diceImg[i].hidden = isBanked;
            if (!isBanked) {
                diceImg[i].lastElementChild.style.backgroundPosition = `-${diceValues[i]-1}00% 0%`;
                diceImg[i].firstElementChild.classList.toggle('selected', isSelected);
            }
        }
    }

    _updateActionButtons({ hasRolledAtLeastOnce, selectableMask, selectedMask, bankedMask }) {
        const isHotDice = bankedMask && bankedMask.length === 6 && bankedMask.every(Boolean);

        // --- Roll ---
        if (this.buttonRoll) {
            this.buttonRoll.disabled = true; // can always roll
        }

        // --- Bank ---
        if (this.buttonBank) {
            const anySelected = Array.isArray(selectedMask) && selectedMask.some(Boolean);
            this.buttonBank.disabled = isHotDice || !anySelected || (Array.isArray(bankedMask) && bankedMask.every(Boolean));
        }

        // --- End Turn / Pass ---
        if (this.buttonEndTurn) {
            if (!hasRolledAtLeastOnce) {
                this.buttonEndTurn.textContent = "Pass";
                this.buttonEndTurn.disabled = false;
            } else {
                this.buttonEndTurn.textContent = "End Turn";
                this.buttonEndTurn.disabled = !!isHotDice;
            }
        }

        // --- Select All / Deselect All ---
        if (this.buttonSelectAll) {
            const anySelectable = Array.isArray(selectableMask) && selectableMask.some(Boolean);
            this.buttonSelectAll.disabled = !anySelectable;

            if (anySelectable) {
                const allSelectableAlreadySelected = selectableMask.every((v, i) => !v || selectedMask[i]);
                this.buttonSelectAll.textContent = allSelectableAlreadySelected ? "Deselect All" : "Select All";
            } else {
                this.buttonSelectAll.textContent = "Select All";
            }
        }
    }

    _allSelectableAlreadySelected(selectableMask, selectedMask) {
        return selectableMask.every((v, i) => !v || selectedMask[i]);
    }

    _applyDiceEnabledMask(selectableMask) {
        const diceClicks = this._getDiceImg();
        for (let i = 0; i < diceClicks.length && i < selectableMask.length; i++) {
            diceClicks[i].classList.toggle('disabled', !selectableMask[i]); 
            diceClicks[i].firstElementChild.classList.toggle('disabled', !selectableMask[i]); 
            diceClicks[i].lastElementChild.classList.toggle('disabled', !selectableMask[i]); 
        }
    }

    _onFarkle() {
    // Disable roll immediately when Farkle occurs
    if (this.rollBtn) this.rollBtn.disabled = true;

    // Optional: give user feedback
    const msg = document.querySelector("#message");
    if (msg) msg.textContent = "Farkle! You must end your turn.";
}

    _setScoreDisplay(currentRollScore, runScore, totalScore) {
        if (this.containerScore) this.containerScore.textContent = String(currentRollScore);
        if (this.containerRunScore) this.containerRunScore.textContent = String(runScore);
        if (this.containerTotalScore) this.containerTotalScore.textContent = String(totalScore);
    }

    // INFO ONLY → bottom message box
    _setMessage(text) {
        this._lastMessage = text || "";
        this._renderMessageBox();
    }

    _showHelpBubbleNearEvent(evt, text) {
        const bubble = document.getElementById("message");
        if (!bubble) return;

        bubble.textContent = text;
        bubble.classList.remove("hidden");
        bubble.classList.add("visible");

        const outsideClick = (e) => {
            const rect = bubble.getBoundingClientRect();
            const tol = 0.011;
            const inside =
                e.clientX >= rect.left - rect.width * tol &&
                e.clientX <= rect.right + rect.width * tol &&
                e.clientY >= rect.top - rect.height * tol &&
                e.clientY <= rect.bottom + rect.height * tol;
            if (!inside) this._hideHelpBubble();
        };
        setTimeout(() => {
            document.addEventListener("mousedown", outsideClick, { once: true });
        }, 50);
    }

    _hideHelpBubble() {
        const bubble = document.getElementById("message");
        if (!bubble) return;
        bubble.classList.remove("visible");
        bubble.classList.add("hidden");
    }

    _renderMessageBox() {
        if (!this.showInfoBox) return;
        const box = this.containerMessage || document.getElementById("message");
        if (!box) return;

        const msg = (this._lastMessage || "").trim();
        box.textContent = msg;

        if (msg) {
            box.classList.remove("hidden");
            box.classList.add("visible");
        } else {
            box.classList.remove("visible");
            box.classList.add("hidden");
        }
    }

    // Add: visual farkle toggle — applies/removes .farkle on the dice container
    _setFarkleVisual(on = false) {
        if (!this.containerDice) return;
        if (on) this.containerDice.classList.add("farkle");
        else this.containerDice.classList.remove("farkle");
    }
    
    _wireWinModalButtons() {
        if (!this.winModal) return;

        const close = () => this._closeWinModal();

        if (this.winModalExit) {
            this.winModalExit.addEventListener("click", close);
        }

        if (this.winModalButtons && this.winModalButtons.length) {
            this.winModalButtons.forEach((btn) => {
                const label = (btn.textContent || "").trim().toLowerCase();

                if (label.startsWith("new game")) {
                    console.log("clickn")
                    btn.addEventListener("click", () => {
                        close();
                        // simplest version: full reset
                        window.location.reload();
                    });
                } else if (label.startsWith("settings")) {
                    console.log("clicks")
                    btn.addEventListener("click", () => {
                        close();
                        window.open(
                            "index.html",
                            "_self",
                        )
                    });
                } else {
                    // Rick Roll Yourself
                    console.log("clickr")
                    btn.addEventListener("click", () => {
                        close();
                        window.open(
                            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            "_blank",
                        );
                    });
                }
            });
        }
    }

       _updateWinModalBars(players = []) {
        if (!this.winModal) return;
        const list = this.winModal.querySelector("ul.bar-scores");
        if (!list) return;

        const items = Array.isArray(players) && players.length
            ? players.slice(0, 6)
            : [];

        // If nothing provided, leave the static mockup alone.
        if (!items.length) return;

        const maxScore = items.reduce(
            (max, p) => Math.max(max, Number(p.totalScore) || 0),
            0
        ) || 1;

        // Let CSS know how many bars we actually have (again, max 6).
        const root = document.documentElement;
        if (root) {
            root.style.setProperty(
                "--player-count",
                String(Math.min(items.length, 6))
            );
        }

        list.innerHTML = "";

        for (const p of items) {
            const score = Number(p.totalScore) || 0;
            const scale = score <= 0 ? 0 : score / maxScore;

            const li = document.createElement("li");
            li.innerHTML = `
                <div class="bar-contents-container" style="--bar-scale:${scale}">
                    <img src="assets/dicedn.png" alt="dice icon" />
                    <span class="scorelist-player">${p.name}</span>
                    <span class="scorelist-score">${score}</span>
                    <span class="circle"></span>
                </div>
            `;

            // optional: tint bars using the PlayerHandler palette if provided
            const bar = li.querySelector(".bar-contents-container");
            if (bar && p.color) {
                bar.style.setProperty("--bar-bg", p.color.bg || "");
                bar.style.setProperty("--bar-fg", p.color.fg || "");
                bar.style.setProperty("--bar-border", p.color.border || "");
            }

            list.appendChild(li);
        }
    }

    _openWinModal(players) {
        if (!this.winModal) return;
        this._updateWinModalBars(players);
        this.winModal.classList.add("is-open");
    }

    _closeWinModal() {
        if (!this.winModal) return;
        this.winModal.classList.remove("is-open");
    }
}
