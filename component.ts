import fsexp from "fast-sexpr";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { platform } from 'node:os';
import SExpr from "s-expression.js";
import { kicad_cli_path, kicad_path } from "./kicad";
import { Pin } from "./pin";
import chalk from 'chalk';
import { ReferenceCounter } from "./reference_counter";
const referenceCounter = new ReferenceCounter();

const S = new SExpr()

export interface IComponent {
    symbol?: string, reference?: string | undefined, value?: string, footprint?: string, 
    prefix?: string, datasheet?: string, description?: string, voltage?: string, 
    wattage?: string, uuid?: string, mpn?: string, dnp?: boolean, 
    pcb?: { x: number, y: number, rotation: number }, pins?: Pin[], via?: boolean,
    simulation?: {include: boolean, model?: string}
}

/**
 * Create a new component. 
 * @export
 * @class Component
 * @typedef {Component}
 * @property {string} footprint - Footprint of component `Resistor_SMD:R_0603_1608Metric`
 * @property {string} reference - Reference designator for component R1
 * @property {string} value - Value for component `1 kOhm`
 * @property {string} datasheet - Link to component datasheet
 * @property {string} description - Description of component
 * @property {string} mpn - Manufacturer Part Number
 * @property {PCB} pcb - x, y, rotation of component on PCB
 * @property {boolean} dnp - TRUE if component is Do Not Place, false to place component
 */
export class Component {
    reference: string = '';
    value: string = '';
    footprint: string = '';
    datasheet: string = '';
    description: string = '';
    voltage: string = '';
    wattage: string = '';
    mpn: string = '';
    pcb: { x: number, y: number, rotation?: number } = { x: 0, y: 0, rotation: 0 };
    dnp: boolean = false;
    uuid: string = '';
    #footprint_file?: string = '';
    pins: Pin[] = [];
    via: boolean = false;
    simulation: {include: boolean, model: string} = {include: false, model: ''};

    /**
     * `constructor` for Component.
     *
     * @constructor
     * @param {?string} reference reference designator (R1)
     * @param {?string} value value of component (1 kOhm)
     * @param {?string} footprint footprint (Resistor_SMD:R_0603_1608Metric)
     * @param {?string} prefix prefix for reference designator (U)
     * @param {?string} datasheet link to component datasheet
     * @param {?string} description description of component
     * @param {?string} voltage voltage rating of component
     * @param {?string} wattage wattage rating of component
     * @param {?string} mpn Manufacturer Part Number
     * @param {?boolean} dnp TRUE if component is Do Not Populate, false to place component
     * @example
     * ```ts
     * let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * ```
     */
    constructor({ reference, value, footprint, prefix, datasheet, description, voltage, wattage, mpn, via, uuid, simulation }: IComponent = {}) {
        if (reference != undefined) {
            this.reference = reference;
            if (!referenceCounter.setReference(reference)) {
                this.reference = referenceCounter.getNextReference(prefix || 'U');
                //console.log(`  🚩  renaming ${reference} to ${this.reference}`);
                process.stdout.write(chalk.whiteBright.bgYellow(`🚩  renaming ${reference} to ${this.reference}` + '\n'));
            }
        } else {
            this.reference = referenceCounter.getNextReference(prefix || 'U');
        }
        if (value != undefined) this.value = value;
        if (footprint != undefined) this.footprint = footprint
        if (datasheet != undefined) this.datasheet = datasheet;
        if (description != undefined) this.description = description;
        if (voltage != undefined) this.voltage = voltage;
        if (wattage != undefined) this.wattage = wattage;
        if (mpn != undefined) this.mpn = mpn;
        if (simulation != undefined) this.simulation = { include: simulation.include, model: simulation.model || '' };
        this.via = via || false;
        if (uuid == undefined){
             this.uuid = randomUUID();
        } else {
            this.uuid = uuid;
        }

        process.stdout.write(chalk.blue.bold(this.reference) + ' created\n');

    }

    /**
     * Returns a {@link Pin} object from the component
     * 
     * @param {(number | string)} number
     * @returns {Pin}
     * @example
     * ```ts
     * let resistor = new Component({});
     * resistor.pin(1);
     * ```
     */
    pin(number: number | string): Pin {
        const existingPin = this.pins.find(pin => pin.number === number);
        if (existingPin) {
            return existingPin;
        }

        const newPin = new Pin(this.reference, number);
        this.pins.push(newPin);
        return newPin;
        //return new Pin(this.reference, number);
    }

    /**
     * Used internally
     * @ignore
     */
    footprint_lib(footprint: string): string {
        const runCommand = (command: string) => {
            try {
                execSync(`${command}`);
            } catch (e) {

            }
            return true;
        };

        // if we already found this symbol, return it before doing anything
        if (this.#footprint_file != '') return this.#footprint_file!;

        let footprint_file_contents = "";
        let footprint_file_name = footprint.split(":");
        let kicad_footprint: string = '';

        if (platform() == 'win32') {
            kicad_footprint = kicad_path + 'share/kicad/footprints';
        } else {
            kicad_footprint = kicad_path + 'footprints';
        }

        try {
            if (fs.existsSync(`${kicad_footprint}/${footprint_file_name[0]}.pretty/${footprint_file_name[1]}.kicad_mod`)) {
                footprint_file_contents = fs.readFileSync(
                    `${kicad_footprint}/${footprint_file_name[0]}.pretty/${footprint_file_name[1]}.kicad_mod`,
                    "utf8"
                );
            } else {
                // if the footprint is in this folder, it came from elsewhere and might be an older format
                // run kicad-cli to fix/upgrade the footprint
                runCommand(`"${kicad_cli_path}" fp upgrade ./build/lib/footprints/`);

                footprint_file_contents = fs.readFileSync(
                    `./build/lib/footprints/${footprint_file_name[1]}.kicad_mod`,
                    "utf8"
                );
            }

            footprint_file_contents = footprint_file_contents.replaceAll('"', "`");

            const l = fsexp(footprint_file_contents).pop();

            // some footprints have a 'module' instead of 'footprint'
            if (l[0] == 'module') {
                l[0] = 'footprint'
            }
            this.#footprint_file = S.serialize(l).replaceAll("`", '"');

        } catch (err) {
            console.error(err);
        }

        if (this.#footprint_file == '') {
            //console.log('- ', chalk.red.bold(`ERROR: footprint ${footprint} not found`))
        }

        return this.#footprint_file!;
    }

}