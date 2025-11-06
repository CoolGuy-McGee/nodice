export default class c_OptionsMenu {
    constructor(DICE_SCORES) {
        this.DICE_SCORES = DICE_SCORES;
        this.popup = document.getElementById("options-popup");
        this.btnOpen = document.getElementById("options-btn");
        this.btnClose = document.getElementById("options-close-btn");
        this.btnScoreMenu = document.getElementById("options-score-btn");
        this.scoreSubmenu = document.getElementById("score-submenu");
        this.btnScoreSave = document.getElementById("options-score-save-btn");

        // New rule option fields
        this.chkGetOnBoard = document.getElementById("opt-enable-get-on-board");
        this.inputGetOnBoard = document.getElementById("opt-get-on-board-value");
        this.chkMinRun = document.getElementById("opt-enable-min-run");
        this.inputMinRun = document.getElementById("opt-min-run-value");

        // Score input fields
        this.scoreInputs = {
            one_1: document.getElementById("opt-score-one-1"),
            one_5: document.getElementById("opt-score-one-5"),
            three_1: document.getElementById("opt-score-three-1"),
            three_2: document.getElementById("opt-score-three-2"),
            three_3: document.getElementById("opt-score-three-3"),
            three_4: document.getElementById("opt-score-three-4"),
            three_5: document.getElementById("opt-score-three-5"),
            three_6: document.getElementById("opt-score-three-6"),
            four_any: document.getElementById("opt-score-four-any"),
            five_any: document.getElementById("opt-score-five-any"),
            six_any: document.getElementById("opt-score-six-any"),
            straight: document.getElementById("opt-score-straight"),
            two_triplets: document.getElementById("opt-score-two-triplets"),
            four_any_w_pair: document.getElementById("opt-score-four-any-w-pair")
        };

        // Default rule values
        this.rules = {
            enableGetOnBoard: true,
            getOnBoardValue: 500,
            enableMinRun: true,
            minRunValue: 350
        };

        this._wireEvents();
        this._syncScoreInputs();
        this._syncRuleInputs();
    }

    _wireEvents() {
        if (this.btnOpen) this.btnOpen.addEventListener("click", () => this._show());
        if (this.btnClose) this.btnClose.addEventListener("click", () => this._hide());
        if (this.btnScoreMenu) this.btnScoreMenu.addEventListener("click", () => this._toggleScoreSubmenu());
        if (this.btnScoreSave) this.btnScoreSave.addEventListener("click", () => this._saveScores());

        // Save rule changes on input
        if (this.chkGetOnBoard) this.chkGetOnBoard.addEventListener("change", () => this._saveRules());
        if (this.inputGetOnBoard) this.inputGetOnBoard.addEventListener("change", () => this._saveRules());
        if (this.chkMinRun) this.chkMinRun.addEventListener("change", () => this._saveRules());
        if (this.inputMinRun) this.inputMinRun.addEventListener("change", () => this._saveRules());
    }

    _show() {
        if (this.popup) this.popup.style.display = "block";
        this._hideScoreSubmenu();
        this._syncRuleInputs();
    }

    _hide() {
        if (this.popup) this.popup.style.display = "none";
        this._hideScoreSubmenu();
    }

    _toggleScoreSubmenu() {
        if (this.scoreSubmenu) {
            if (this.scoreSubmenu.style.display === "block") {
                this._hideScoreSubmenu();
            } else {
                this._showScoreSubmenu();
            }
        }
    }

    _showScoreSubmenu() {
        if (this.scoreSubmenu) {
            this.scoreSubmenu.style.display = "block";
            this._syncScoreInputs();
        }
    }

    _hideScoreSubmenu() {
        if (this.scoreSubmenu) this.scoreSubmenu.style.display = "none";
    }

    _syncScoreInputs() {
        for (const key in this.scoreInputs) {
            if (this.scoreInputs[key]) this.scoreInputs[key].value = this.DICE_SCORES[key];
        }
    }

    _syncRuleInputs() {
        if (this.chkGetOnBoard) this.chkGetOnBoard.checked = this.rules.enableGetOnBoard;
        if (this.inputGetOnBoard) this.inputGetOnBoard.value = this.rules.getOnBoardValue;
        if (this.chkMinRun) this.chkMinRun.checked = this.rules.enableMinRun;
        if (this.inputMinRun) this.inputMinRun.value = this.rules.minRunValue;
    }

    _saveScores() {
        for (const key in this.scoreInputs) {
            if (this.scoreInputs[key]) {
                const val = Number(this.scoreInputs[key].value);
                if (!isNaN(val)) this.DICE_SCORES[key] = val;
            }
        }
        this._hideScoreSubmenu();
    }

    _saveRules() {
        if (this.chkGetOnBoard) this.rules.enableGetOnBoard = this.chkGetOnBoard.checked;
        if (this.inputGetOnBoard) this.rules.getOnBoardValue = Number(this.inputGetOnBoard.value) || 0;
        if (this.chkMinRun) this.rules.enableMinRun = this.chkMinRun.checked;
        if (this.inputMinRun) this.rules.minRunValue = Number(this.inputMinRun.value) || 0;
    }

    getRules() {
        return { ...this.rules };
    }
}