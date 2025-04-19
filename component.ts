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
import { Schematic } from "./schematic";
const referenceCounter = new ReferenceCounter();

const S = new SExpr()

export interface IComponent {
    symbol?: string, reference?: string | undefined, value?: string, footprint?: string,
    prefix?: string, datasheet?: string, description?: string, voltage?: string,
    wattage?: string, uuid?: string, mpn?: string, dnp?: boolean,
    pcb?: { x: number, y: number, rotation: number }, pins?: Pin[], via?: boolean,
    simulation?: { include: boolean, model?: string }
}

/**
 * Create a new component. 
 * @export
 * @class Component
 * @typedef {Component}
 * @property {string} reference - Reference designator for component (e.g., R1)
 * @property {string} value - Value for component (e.g., 1 kOhm)
 * @property {string} footprint - Footprint of component (e.g., Resistor_SMD:R_0603_1608Metric)
 * @property {string} datasheet - Link to component datasheet
 * @property {string} description - Description of component
 * @property {string} mpn - Manufacturer Part Number
 * @property {object} pcb - x, y, rotation of component on PCB
 * @property {boolean} dnp - TRUE if component is Do Not Place, false to place component
 * @property {string} uuid - Unique identifier for the component
 * @property {Pin[]} pins - Array of pins associated with the component
 * @property {boolean} via - Indicates if the component has a via
 * @property {object} simulation - Simulation details including model
 * @example
 * ```ts
 * let resistor = new Component({
 *   symbol: "Device:R_Small",
 *   reference: 'R1',
 *   value: '1 kOhm',
 *   footprint: "Resistor_SMD:R_0603_1608Metric",
 *   datasheet: 'http://example.com/datasheet',
 *   description: 'A small resistor',
 *   mpn: '123-456',
 *   pcb: { x: 10, y: 20, rotation: 90 },
 *   dnp: false
 * });
 * ```
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
    simulation: { include: boolean, model: string } = { include: false, model: '' };

    /**
     * `constructor` for Component.
     *
     * @constructor
     * @param {?string} reference - Reference designator (e.g., R1)
     * @param {?string} value - Value of component (e.g., 1 kOhm)
     * @param {?string} footprint - Footprint (e.g., Resistor_SMD:R_0603_1608Metric)
     * @param {?string} prefix - Prefix for reference designator (e.g., U)
     * @param {?string} datasheet - Link to component datasheet
     * @param {?string} description - Description of component
     * @param {?string} voltage - Voltage rating of component
     * @param {?string} wattage - Wattage rating of component
     * @param {?string} mpn - Manufacturer Part Number
     * @param {?boolean} dnp - TRUE if component is Do Not Populate, false to place component
     * @param {?boolean} via - Indicates if the component has a via
     * @param {?string} uuid - Unique identifier for the component
     * @param {?object} simulation - Simulation details including model
     * @example
     * ```ts
     * let capacitor = new Component({
     *   reference: 'C1',
     *   value: '10 uF',
     *   footprint: "Capacitor_SMD:C_0805",
     *   voltage: '16V',
     *   wattage: '0.1W',
     *   mpn: '789-012',
     *   dnp: true
     * });
     * ```
     */
    constructor({ reference, value, footprint, prefix, datasheet, description, voltage, wattage, mpn, via, uuid, simulation }: IComponent = {}) {
        if (reference != undefined) {
            this.reference = reference;
            const referencePattern = /^[A-Za-z]+\d+$/;
            if (!referencePattern.test(reference)) {
                process.stdout.write(chalk.bgRed(`👺 Error:`) + chalk.bold(` [${reference}, ${value}, ${footprint}] Pin number must be a number or a string` + '\n'));
                process.exit(1);
            }

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
        if (uuid == undefined) {
            this.uuid = randomUUID();
        } else {
            this.uuid = uuid;
        }

        process.stdout.write(chalk.blue.bold(this.reference) + ' created\n');

    }

    /**
     * Returns a {@link Pin} object from the component
     * 
     * @param {(number | string)} number - The pin number or identifier
     * @returns {Pin} - The pin object associated with the given number
     * @example
     * ```ts
     * let resistor = new Component({});
     * let pin1 = resistor.pin(1);
     * console.log(pin1);
     * ```
     */
    pin(number: number | string): Pin {
        if (typeof number !== 'number' && typeof number !== 'string') {
            process.stdout.write(chalk.bgRed(`👺 Error:`) + chalk.bold(` Pin number must be a number or a string` + '\n'));
            process.exit(1);
        }
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
     * Retrieves the footprint library for the component.
     * Used internally to manage footprint files.
     * 
     * @param {string} footprint - The footprint identifier
     * @returns {string} - The serialized footprint data
     * @ignore
     */
    footprint_lib(footprint: string): string {
        const runCommand = (command: string) => {
            try {
                execSync(`${command}`, { stdio: 'ignore' });
            } catch (e) {
                console.log(e)
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