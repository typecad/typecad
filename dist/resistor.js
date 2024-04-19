"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resistor0402 = exports.Resistor0603 = exports.Resistor = void 0;
const _1 = require(".");
class Resistor extends _1.Component {
}
exports.Resistor = Resistor;
class Resistor0603 extends Resistor {
    constructor() {
        super(...arguments);
        this.Footprint = 'Resistor_SMD:R_0603_1608Metric';
    }
}
exports.Resistor0603 = Resistor0603;
class Resistor0402 extends Resistor {
    constructor() {
        super(...arguments);
        this.Footprint = 'Resistor_SMD:R_0402_1005Metric';
    }
}
exports.Resistor0402 = Resistor0402;
