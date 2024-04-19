"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Power = exports.I2C = void 0;
const _1 = require(".");
class I2C {
    constructor() {
        this.sda = new _1.Pin({ Name: 'sda', type: 'bidirectional' });
        this.scl = new _1.Pin({ Name: 'scl', type: 'output' });
    }
}
exports.I2C = I2C;
class Power {
    constructor(voltage) {
        this.vcc = new _1.Pin({ Name: 'vcc', type: 'input', Number: 1 });
        this.gnd = new _1.Pin({ Name: 'gnd', type: 'passive', Number: 2 });
        this.voltage = voltage;
    }
}
exports.Power = Power;
