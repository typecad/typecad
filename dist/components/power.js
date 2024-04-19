"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GND = exports.VCC = exports.P10V = void 0;
const __1 = require("..");
class P10V extends __1.Component {
    constructor() {
        super(...arguments);
        this.Reference = '#PWR';
        this.Value = '+10V';
        // pins
        this.pin1 = new __1.Pin({ Number: 1, Owner: this, type: 'passive' });
        // constructor(nn: Bounds){
        //     super(nn.x, nn.y);
        //     this.symbol = "power:+10V";
        // }
    }
}
exports.P10V = P10V;
class VCC extends __1.Component {
    constructor() {
        super(...arguments);
        this.Footprint = '';
        this.Reference = '#PWR?';
        // pins
        this.vcc = new __1.Pin({ Number: 1, Owner: this, type: 'passive' });
        // constructor(value: number, nn: Bounds);
        // constructor(value: number, x: number, y: number);
        // constructor(...args: any[]) {
        //     super();
        //     this.symbol = "power:VCC";
        //     // nn or xy
        //     if (args.length == 2) {
        //         this.xy(args[0], args[1]);
        //     } else {
        //         this.xy(args[0].x, args[0].y)
        //     }
        // }
    }
}
exports.VCC = VCC;
class GND extends __1.Component {
    constructor() {
        super(...arguments);
        this.Footprint = '';
        this.Reference = '#PWR?';
        // pins
        this.gnd = new __1.Pin({ Number: 1, Owner: this });
        // constructor(value: number, nn: Bounds);
        // constructor(value: number, x: number, y: number);
        // constructor(value: number, ...args: any[]) {
        //     super();
        //     this.symbol = "power:GND";
        //     // nn or xy
        //     if (args.length == 2) {
        //         this.xy(args[0], args[1]);
        //     } else {
        //         this.xy(args[0].x, args[0].y)
        //     }
        // }
    }
}
exports.GND = GND;
