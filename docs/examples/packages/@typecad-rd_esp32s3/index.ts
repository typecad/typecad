import * as _0603 from '@typecad/passives/0603';
import { Schematic, PCB, Component } from '@typecad/typecad';
import { ESP32_S3_MINI_1_N8 } from './ESP32_S3_MINI_1_N8';
import { I2C, UART, USB, Power } from '@typecad/typecad';

interface Ird_esp32s3 {
    schematic?: Schematic,
    power_supply?: Power,
    reference?: string,
    passives?: typeof _0603
    pcb?: PCB;
};

/**
 * ### rd_esp32s3 - Description
 * 
 * #### Input Connections * 
 * power_supply: PowerSupply - 3.3 volt power supply
 * 
 */
export class rd_esp32s3 {
    pcb: PCB;
    U1: ESP32_S3_MINI_1_N8;
    C1: _0603.Capacitor;
    C3: _0603.Capacitor;
    C8: _0603.Capacitor;
    R7: _0603.Resistor;
    SW1: Component;
    C2: _0603.Capacitor;
    R1: _0603.Resistor;
    #schematic: Schematic;
    #passives: typeof _0603;
    #vin: Power;
    power_supply: Power;
    i2c: I2C;
    uart_0: UART;
    uart_1: UART;
    usb: USB;

    constructor({ schematic, reference, power_supply, passives, pcb }: Ird_esp32s3 = {}) {
        if (schematic) {
            this.#schematic = schematic;
        } else {
            throw new Error(`schematic: Schematic is a required typeCAD parameter`);
        }
        if (power_supply) this.power_supply = power_supply;
        if (reference) this.U1.reference = reference;
        if (pcb) this.pcb = pcb;
        if (passives) {
            this.#passives = passives;
        } else {
            this.#passives = _0603;
        }

        this.U1 = new ESP32_S3_MINI_1_N8(reference);
        this.#vin = new Power({power: this.U1._3V3, gnd: this.U1.GND_1, voltage: 3.3});
        this.C1 = new this.#passives.Capacitor({ value: '22uF', description: 'C1' });
        this.C3 = new this.#passives.Capacitor({ value: '0.1uF', description: 'C3' });
        this.C8 = new this.#passives.Capacitor({ value: '0.1uF', description: 'C8' });
        this.R7 = new this.#passives.Resistor({ value: '100kΩ', description: 'R7' });
        this.SW1 = new Component({ footprint: 'Button_Switch_SMD:SW_SPST_TL3342', prefix: 'SW' });
        this.C2 = new this.#passives.Capacitor({ value: '1uF', description: 'C2' });
        this.R1 = new this.#passives.Resistor({ value: '10kΩ', description: 'R1' });
        this.i2c = new I2C(this.U1.IO8, this.U1.IO9);
        this.uart_0 = new UART(this.U1.RXD0, this.U1.TXD0, this.U1.IO15, this.U1.IO16);
        this.uart_1 = new UART(this.U1.IO18, this.U1.IO17, this.U1.IO19, this.U1.IO20);
        this.usb = new USB(this.U1.IO20, this.U1.IO19);
    }

    add() {
        if (this.power_supply != undefined) {
            if (this.power_supply.voltage != this.#vin.voltage) {
                throw new Error(`Power supply voltage (${this.#vin.voltage}) does not match input voltage (${this.#vin.voltage})`);
            }
            this.#schematic.named('vin').net(this.power_supply.power!, this.#vin.power!);
            this.#schematic.named('gnd').net(this.power_supply.gnd!, this.#vin.gnd!);
        }

        this.#schematic.named('gnd').net(
            this.U1.GND_1, this.U1.GND_2, this.U1.GND_3, this.U1.GND_4, this.U1.GND_5, this.U1.GND_6,
            this.U1.GND_7, this.U1.GND_8, this.U1.GND_9, this.U1.GND_10, this.U1.GND_11, this.U1.GND_12, this.U1.GND_13, this.U1.GND_14,
            this.U1.GND_15, this.U1.GND_16, this.U1.GND_17, this.U1.GND_18, this.U1.GND_19, this.U1.GND_20, this.U1.GND_21, this.U1.GND_22,
            this.U1.GND_23, this.U1.GND_24, this.U1.GND_25, this.U1.GND_26, this.U1.GND_27, this.U1.GND_28, this.U1.GND_29, this.U1.GND_30,
            this.U1.GND_31, this.U1.GND_32);

        // power section
        this.#schematic.named('3v3').net(this.C1.pin(1), this.C3.pin(1), this.U1._3V3);
        this.#schematic.net(this.C1.pin(2), this.C3.pin(2));

        // SW1 ~ EN
        this.#schematic.net(this.SW1.pin(1), this.C8.pin(1));
        this.#schematic.net(this.SW1.pin(2), this.C8.pin(2), this.R7.pin(1));
        this.#schematic.named('en').net(this.R7.pin(2), this.U1.EN);

        // // EN RC Circuit
        this.#schematic.net(this.U1._3V3, this.R1.pin(1));
        this.#schematic.named('en').net(this.R1.pin(2), this.C2.pin(1), this.U1.EN);
        this.#schematic.net(this.U1.GND_1, this.C2.pin(2));

        // place components
        this.#schematic.add(this.U1, this.C1, this.C3, this.SW1, this.C8, this.R7, this.C2, this.R1);
    }

    place(pcb?: PCB) {
        if (pcb) this.pcb = pcb;

        this.U1.pcb = { x: 148.21, y: 97.335, rotation: 0 };
        this.C1.pcb = { x: 136.385, y: 91.44, rotation: 180 };
        this.C3.pcb = { x: 136.385, y: 93.98, rotation: 180 };
        this.R7.pcb = { x: 136.335, y: 99.06, rotation: 180 };
        this.C8.pcb = { x: 136.385, y: 96.52, rotation: 0 };
        this.R1.pcb = { x: 159.295, y: 91.44, rotation: 180 };
        this.C2.pcb = { x: 159.245, y: 93.98, rotation: 0 };
        this.SW1.pcb = { x: 148.9202, y: 111.7092, rotation: 180 };

        this.pcb.group('rd_esp32s3', this.U1, this.C1, this.C3, this.SW1, this.C8, this.R7, this.C2, this.R1);
        this.pcb.create();
    }
}