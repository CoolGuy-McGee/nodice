import c_initialize from "./c_Initialize.js";

export default class c_gameStart {
    constructor() {
        this._init = null;
    }

    start() {
        this._init = new c_initialize({
            requestedPlayers: 16 // put player var here (it's only 2 as a placeholder)
        });
        this._init.run();
    }
}
