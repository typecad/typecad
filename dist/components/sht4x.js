"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHT4x = void 0;
const __1 = require("..");
class SHT4x extends __1.Component {
    ;
    constructor(nn) {
        super("Sensor_Humidity:SHT4x", nn);
        this.Footprint = 'Sensor_Humidity:Sensirion_DFN-4_1.5x1.5mm_P0.8mm_SHT4x_NoCentralPad';
        this.Reference = "U?";
        // pins
        this.SDA = new __1.Pin({ Number: 1, Owner: this });
        this.SCL = new __1.Pin({ Number: 2, Owner: this });
        this.VDD = new __1.Pin({ Number: 3, Owner: this });
        this.VSS = new __1.Pin({ Number: 4, Owner: this });
    }
}
exports.SHT4x = SHT4x;
