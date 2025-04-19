import * as _0603 from '@typecad/passives/0603';
import { Component, Schematic, PCB, Power } from '@typecad/typecad';
import { BQ24210DQCT } from './BQ24210DQCT';
interface Ird_bq24210 {
    schematic?: Schematic,
    charge?: Power,
    battery?: Power,
    reference?: string,
    passives?: typeof _0603
    pcb?: PCB;
    charge_current?: number;
};

/**
 * ### [bq24210](https://www.ti.com/product/BQ24210) Reference Design
 * > 800mA, single-input, single cell Li-Ion Solar battery charger
 * 
 * #### Input Connections
 * - `charge: Power` 0-20 volt charging source
 * - `battery: Power` Li-Ion battery
 * 
 * #### Output Connections
 * - `C2.pin(1)` - battery output
 * - `U1.CHG` - charge indicator
 * - `U1.PG` - power good indicator
 */
export class rd_bq24210 {
    #schematic: Schematic;
    #passives: typeof _0603;
    charge: Power;
    battery: Power;
    pcb: PCB;
    charge_current: number;
    U1: BQ24210DQCT;
    R1: _0603.Resistor;
    R2: _0603.Resistor;
    R3: _0603.Resistor;
    R4: _0603.Resistor;
    R5: _0603.Resistor;
    C1: _0603.Capacitor;
    C2: _0603.Capacitor;
    D1: _0603.LED;
    D2: _0603.LED;
    SJ1: Component;
    SJ2: Component;

    constructor({ schematic, reference, charge, passives, pcb, charge_current, battery }: Ird_bq24210 = {}) {
        if (schematic) {
            this.#schematic = schematic;
        } else {
            throw new Error(`schematic: Schematic is a required typeCAD parameter`);
        }
        if (charge) {
             this.charge = charge;
        } else {
            throw new Error(`power_supply: Power is a required typeCAD parameter`);
        }
        if (reference) this.U1.reference = reference;
        if (pcb) this.pcb = pcb;
        if (battery) this.battery = battery;

        if (passives) {
            this.#passives = passives;
        } else {
            this.#passives = _0603;
        }

        if (charge_current) {
            if (this.charge_current > 800) throw new Error("Requested charge current larger than maximum");
            this.charge_current = charge_current;
        } else {
            this.charge_current = 800;
        }

        // formula in datasheet section 9.2.2
        let _r4_value = (390 / this.charge_current) * 100;

        this.U1 = new BQ24210DQCT(reference);
        this.C1 = new this.#passives.Capacitor({ value: '1uF/100V', description: 'C1' });
        this.C2 = new this.#passives.Capacitor({ value: '1uF/14V', description: 'C2' });
        this.R1 = new this.#passives.Resistor({ value: '2 kΩ', description: 'R1' });
        this.R2 = new this.#passives.Resistor({ value: '2 kΩ', description: 'R2' });
        this.R3 = new this.#passives.Resistor({ value: '21.5 kΩ', description: 'R3' });
        this.R4 = new this.#passives.Resistor({ value: `${_r4_value} Ω`, description: 'R4' });
        this.R5 = new this.#passives.Resistor({ value: '10 kΩ', description: 'R5' });
        this.D1 = new this.#passives.LED({});
        this.D2 = new this.#passives.LED({});
        this.SJ1 = new Component({ footprint: 'Jumper:SolderJumper-2_P1.3mm_Bridged_RoundedPad1.0x1.5mm' });
        this.SJ2 = new Component({ footprint: 'Jumper:SolderJumper-2_P1.3mm_Bridged_RoundedPad1.0x1.5mm' });
    }

    add() {
        if (!this.charge.power){
            throw new Error(`power_supply.power: Power is a required typeCAD parameter`);
        }
        if (!this.charge.gnd) {
            throw new Error(`power_supply.gnd: Power is a required typeCAD parameter`);
        }

        if (!this.battery.power) {
            throw new Error(`power_supply.power: Power is a required typeCAD parameter`);
        }
        if (!this.battery.gnd) {
            throw new Error(`power_supply.gnd: Power is a required typeCAD parameter`);
        }

        // ground pins
        this.#schematic.named('gnd').net(this.U1.EP, this.U1.VSS);

        // vdpm pin
        this.#schematic.dnc(this.U1.VDPM);

        // vbus pin (c1)
        this.#schematic.named(`${this.U1.reference}:vbus`).net(this.charge.power, this.U1.VBUS, this.C1.pin(1));
        this.#schematic.named('gnd').net(this.charge.gnd, this.C1.pin(2));

        // en pin
        this.#schematic.named(`${this.U1.reference}:en`).net(this.U1.EN, this.U1.PG);

        // iset pin (r4)
        this.#schematic.named(`${this.U1.reference}:iset`).net(this.U1.ISET, this.R4.pin(1));
        this.#schematic.net(this.charge.gnd, this.R4.pin(2));

        // BAT/chg/pg pin (r1, r2, c2, sj1, sj2)
        this.#schematic.named(`${this.U1.reference}:bat`).net(this.U1.BAT, this.R1.pin(1), this.R2.pin(1), this.C2.pin(1));
        this.#schematic.net(this.battery.gnd, this.C2.pin(2));
        this.#schematic.net(this.battery.power, this.U1.BAT);

        // LEDs, diodes and jumpers
        this.#schematic.net(this.R1.pin(2), this.D1.pin(2));
        this.#schematic.net(this.D1.pin(1), this.SJ1.pin(2));
        this.#schematic.named(`${this.U1.reference}:chg`).net(this.SJ1.pin(1), this.U1.CHG);

        this.#schematic.net(this.R2.pin(2), this.D2.pin(2));
        this.#schematic.net(this.D2.pin(1), this.SJ2.pin(2));
        this.#schematic.named(`${this.U1.reference}:pg`).net(this.SJ2.pin(1), this.U1.PG);

        // vtsb/ts pin
        this.#schematic.named(`${this.U1.reference}:vtsb`).net(this.U1.VTSB, this.R3.pin(1));
        this.#schematic.named(`${this.U1.reference}:ts`).net(this.R3.pin(2), this.R5.pin(1), this.U1.TS);
        this.#schematic.net(this.battery.gnd, this.R5.pin(2));

        // dnc vdpm
        this.#schematic.dnc(this.U1.VDPM);

        this.#schematic.create(this.U1, this.R1, this.R2, this.R3, this.R4, this.R5, this.C1, this.C2, this.D1, this.D2, this.SJ1, this.SJ2);
    }

    place(pcb: PCB) {
        if (pcb) this.pcb = pcb;

        // place components
        this.U1.pcb = { x: 150, y: 99.5, rotation: 0 };
        this.C1.pcb = { x: 146.95, y: 96.5, rotation: 180 };
        this.C2.pcb = { x: 150, y: 96.5, rotation: 180 };
        this.R1.pcb = { x: 153.6, y: 97.725, rotation: -90 };
        this.R2.pcb = { x: 155.1, y: 97.725, rotation: -90 };
        this.R3.pcb = { x: 146.325, y: 101, rotation: 0 };
        this.R4.pcb = { x: 146.325, y: 98.6028, rotation: 180 };
        this.R5.pcb = { x: 146.325, y: 102.5, rotation: 180 };
        this.D1.pcb = { x: 153.1, y: 104.5, rotation: 90 };
        this.D2.pcb = { x: 155.8, y: 104.5, rotation: 90 };
        this.SJ1.pcb = { x: 153.1, y: 100.95, rotation: -90 };
        this.SJ2.pcb = { x: 155.7, y: 100.9, rotation: -90 };

        this.pcb.group('rd-bq24210', this.U1, this.C1, this.C2, this.R1, this.R2, this.R3, this.R4, this.R5, this.D1, this.D2, this.SJ1, this.SJ2);
        pcb.create();
    }
}