import { Pin } from './pin';

export class Bus {}

export class GPIO extends Bus {
    pin = new Pin;
    net = "io";
    constructor(pin: Pin){
        super();
        if (pin){
             this.pin = pin;
             this.net = `${pin.Owner.Reference}:${pin.Name}`;
        }
    }
}

let i2c_count: number = 0;
export class I2C extends Bus {
    sda = {"net": "net", "pin": new Pin}
    scl = {"net": "net", "pin": new Pin}
    constructor(sda: Pin, scl: Pin){
        super();
        i2c_count++;
        this.sda.net = `i2c_${i2c_count}:sda`;
        this.sda.pin = sda;

        this.scl.net = `i2c_${i2c_count}:scl`;
        this.scl.pin = scl;
    }
}

let uart_count: number = 0;
export class UART extends Bus {
    tx = {"net": "net", "pin": new Pin}
    rx = {"net": "net", "pin": new Pin}
    rts = {"net": "net", "pin": new Pin}
    dtr = {"net": "net", "pin": new Pin}
    constructor(rx: Pin, tx: Pin, rts?: Pin, dtr?: Pin){
        super();
        uart_count++;
        this.tx.net = `uart_${uart_count}:tx`;
        this.rx.net = `uart_${uart_count}:rx`;
        this.dtr.net = `uart_${uart_count}:dtr`;
        this.rts.net = `uart_${uart_count}:rts`;
        this.rx.pin = rx;
        this.tx.pin = tx;
        if (rts) this.rts.pin = rts;
        if (dtr) this.dtr.pin = dtr;

    }
}

let usb_count: number = 0;
export class USB extends Bus {
    dP = {"net": "net", "pin": new Pin}
    dN = {"net": "net", "pin": new Pin}
    constructor(DP: Pin, DN: Pin){
        super();
        usb_count++;
        this.dP.net = `usb_${usb_count}:dP`;
        this.dP.pin = DP;
        this.dN.net = `usb_${usb_count}:dN`;
        this.dN.pin = DN;
    }
}