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
    }

    _getDiceImg() {
        // so this is going to be like _getDiceButtons, but instead with the nested <div> structure for imgs
        const byId = [];
        for (let i = 1; i <= 6; i++) {
            const dien = document.getElementsByClassName('dice-display')[i];
            if (dien) byId.push(dien);
        }
        if (byId.length === 6) return byId;

        if (!this.containerDice) return [];
        return Array.from(this.containerDice.querySelectorAll(".dice-display"));
        //this might not work
    }

    _renderDiceLabels(diceValues, selectedMask, bankedMask) {
        const diceImg = this._getDiceImg();
        for (let i = 0; i < diceImg.length && i < diceValues.length; i++) {
            const isSelected = !!selectedMask[i];
            const isBanked = !!bankedMask[i];
            diceImg[i].hidden = isBanked;
            if (!isBanked) {
                // Remove [selected] suffix
                diceButtons[i].textContent = `Die ${i + 1}: ${diceValues[i]}`;
                // Selected dice: green
                if (isSelected) {
                    diceButtons[i].classList.add("selected");
                } else {
                    diceButtons[i].classList.remove("selected");
                }
            }
        }
    }

    _applyDiceEnabledMask(selectableMask) {
        const diceClicks = this._getDiceImg();
            // If the button is hidden (banked), ensure it is disabled as well
            diceButtons[i].disabled = diceButtons[i].hidden ? true : !selectableMask[i];
            // Grey out if not selectable
            if (!selectableMask[i] || diceButtons[i].disabled) {
                diceButtons[i].classList.add("dice-disabled");
            } else {
                diceButtons[i].classList.remove("dice-disabled");
            }
        }
    }

    _setScoreDisplay(currentRollScore, runScore, totalScore) {
        if (this.containerScore) this.containerScore.textContent = String(currentRollScore);
        if (this.containerRunScore) this.containerRunScore.textContent = String(runScore);
        if (this.containerTotalScore) this.containerTotalScore.textContent = String(totalScore);
    }

    _setMessage(textMessage) {
        if (this.containerMessage) this.containerMessage.textContent = textMessage;
    }
}
