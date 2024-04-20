export class Power {
    voltage: number;
    power: string;
    ground: string;
    maximum: number;
    minimum: number;

    constructor(voltage_nominal: number, voltage_minimum?: number, voltage_maximum?: number){
        this.voltage = voltage_nominal;
        this.power = `${voltage_nominal}:power`;
        this.ground = `${voltage_nominal}:ground`;
        if(voltage_maximum) {
            this.maximum = voltage_maximum;
        } else {
            this.maximum = voltage_nominal
        }
        if(voltage_minimum) {
            this.minimum = voltage_minimum;
        } else {
            this.minimum = voltage_nominal
        }
    }
}