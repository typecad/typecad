import { Pin } from "./pin";

export class I2C {
    sda: Pin;
    scl: Pin;
    constructor(scl: Pin, sda: Pin){
        this.sda = sda;
        this.scl = scl;
    }
}

export class UART {
    tx: Pin;
    rx: Pin;
    rts?: Pin;
    dtr?: Pin;
    constructor(rx: Pin, tx: Pin, rts?: Pin, dtr?: Pin){
        this.rx = rx;
        this.tx = tx;
        if (rts) this.rts = rts;
        if (dtr) this.dtr = dtr;
    }
}

export class USB {
    dp: Pin;
    dn: Pin;
    constructor(DP: Pin, DN: Pin){
        this.dp = DP;
        this.dn = DN;
    }
}

export class Power {
    power: Pin;
    gnd: Pin;
    constructor(power: Pin, gnd: Pin){
        power.type = 'power_out';
        gnd.type = 'power_out';
        this.power = power;
        this.gnd = gnd;
    }
}