import { Pin } from '.';
export declare class I2C {
    sda: Pin;
    scl: Pin;
}
export declare class Power {
    vcc: Pin;
    gnd: Pin;
    voltage: number;
    constructor(voltage: number);
}
