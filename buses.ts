import { Pin } from "./pin";
import chalk from 'chalk';

export class I2C {
    sda: Pin;
    scl: Pin;
    constructor(sda: Pin, scl: Pin) {
        this.sda = sda;
        this.scl = scl;
    }
}

export class UART {
    tx: Pin;
    rx: Pin;
    rts?: Pin;
    cts?: Pin;
    constructor(rx: Pin, tx: Pin, rts?: Pin, cts?: Pin) {
        this.rx = rx;
        this.tx = tx;
        if (rts) this.rts = rts;
        if (cts) this.cts = cts;
    }
}

export class USB {
    dp: Pin;
    dn: Pin;
    constructor(DP: Pin, DN: Pin) {
        this.dp = DP;
        this.dn = DN;
    }
}

export class PowerInput {
    power: Pin;
    gnd: Pin;
    voltage?: number;
    constructor(power: Pin, gnd: Pin, voltage?: number) {
        power.type = 'power_in';
        gnd.type = 'power_in';
        this.power = power;
        this.gnd = gnd;
        this.voltage = voltage;
    }
}

export class PowerSupply {
    power: Pin;
    gnd: Pin;
    voltage?: number;
    constructor(power: Pin, gnd: Pin, voltage?: number) {
        power.type = 'power_out';
        gnd.type = 'power_out';
        this.power = power;
        this.gnd = gnd;
        this.voltage = voltage;
    }
}

interface IPower {
    power?: Pin;
    gnd?: Pin;
    voltage?: number;
};
export class Power {
    power: Pin;
    gnd: Pin;
    voltage?: number;
    constructor({ power, gnd, voltage }: IPower = {}) {
        if (power) {
            this.power = power;
        } else {
            process.stdout.write('🏳️ ' + chalk.whiteBright.bold('Error:') + ' `Power` missing required `power` element' + '\n');
            process.exit(1);
        }
        if (gnd) {
            this.gnd = gnd;
        } else {
            process.stdout.write('🏳️ ' + chalk.whiteBright.bold('Error:') + ' `Power` missing required `gnd` element' + '\n');
            process.exit(1);
        }
        if (voltage) {
            this.voltage = voltage;
        }
    }
}