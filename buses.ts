import { Schematic } from '.'
import { Pin } from './pin';

class Bus {
    pin: Pin = new Pin();
    net: string = '';
}

class Net {
    net: string = '';
    pin: Pin = new Pin();
}

export class GPIO extends Bus {
    constructor( name:string, pin?: Pin){
        super();
        this.net = `${name}:io`;
        if (pin){
             this.pin = pin;
             //typecad.net(this.io.net, this.io.pin)
        }
    }
}

export class Power extends Bus {
    power = new Net;
    ground = new Net;
    name: string;

    constructor(typecad: Schematic, name: string, power?: Pin, ground?: Pin){
        super();
        this.name = name;
        this.power.net = `${name}:power`;
        this.ground.net = `${name}:ground`;

        if (power){
            this.power.pin = power;
            typecad.net(this.power.net, this.power.pin)
        }
        if (ground){
            this.ground.pin = ground;
            typecad.net(this.ground.net, this.ground.pin)
        }
        
    }
}

export class I2C extends Bus {
    sda = new Net;
    scl = new Net;
    constructor(name: string, sda: Pin, scl: Pin){
        super();
        this.sda.net = `${name}:sda`;
        this.sda.pin = sda;
        this.scl.net = `${name}:scl`;
        this.scl.pin = scl;
    }
}

export class UART extends Bus {
    rx = new Net;
    tx = new Net;
    constructor(name: string, rx: Pin, tx: Pin){
        super();
        this.rx.net = `${name}:rx`;
        this.rx.pin = rx;
        this.tx.net = `${name}:tx`;
        this.tx.pin = tx;
    }
}

export class USB extends Bus {
    DP = new Net;
    DN = new Net;
    constructor(name: string, DP: Pin, DN: Pin){
        super();
        this.DP.net = `${name}:DP`;
        this.DP.pin = DP;
        this.DN.net = `${name}:DN`;
        this.DN.pin = DN;
    }
}