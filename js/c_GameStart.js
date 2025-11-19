import c_initialize from "./c_Initialize.js";

export default class c_gameStart {
    constructor() {
        this._init = null;
    }

    start() {
        this._init = new c_initialize({
            requestedPlayers: 4 // default to 4 players
        });
        this._init.run();
    }
}
