import { Bounds } from "./bounds";
import { Pin } from "./pin";
import SExpr from "s-expression.js";
import fs from "node:fs";
import fsexp from "fast-sexpr";
import chalk from 'chalk';
import { kicad_path } from "./kicad";
import { platform } from 'node:os';
import { randomUUID, UUID } from "node:crypto";
import { execSync } from "node:child_process";
import { kicad_cli_path } from './kicad'

// const kicad_symbol = "C:/Program Files/KiCad/8.0/share/kicad/symbols"
const S = new SExpr()
let symbols:string[] = ['▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟']
const getRandomElement = () =>
    symbols.length ? symbols[Math.floor(Math.random() * symbols.length)] : undefined

interface IComponent {
    symbol?: string, reference?: string, value?: string, footprint?: string, xy?: Bounds
}
/**
 * Create a new component, defined as a schematic symbol, a footprint, value, and reference designator. 
 * @export
 * @class Component
 * @typedef {Component}
 * @property {string} Footprint - Footprint of component `Resistor_SMD:R_0603_1608Metric`
 * @property {string} symbol - Symbol of component `Device:R_Small`
 * @property {coord} symbol - xy location of component in schematic
 * @property {string} Reference - Reference designator for component R1
 * @property {string} Value - Value for component `1 kOhm`
 * @property {string} Datasheet - Link to component datasheet
 * @property {string} Description - Description of component
 * @property {string} MPN - Manufacturer Part Number
 * @property {string} uuid - UUID of component used by KiCAD
 * @property {PCB} pcb - x, y, rotation of component on PCB
 * @property {boolean} dnp - TRUE if component is Do Not Place, false to place component
 */
export class Component {
    Footprint?: string;
    symbol?: string;
    coord? = { x: 0, y: 0 };
    Reference?: string;
    Value: string = '';
    Datasheet?: string = '';
    Description?: string;
    MPN?: string;
    uuid?: string;
    pcb: {x: number, y: number, rotation?: number} = {x: 0, y: 0, rotation: 0};
    #symbol_lib?: string = '';
    #footprint_file?: string = '';
    instance? = {project: 'xx', uuid: 'xx'};
    dnp?: boolean = false;

    /**
     * `constructor` for Component.
     *
     * @constructor
     * @param {?string} symbol for the component (Device:R_Small)
     * @param {?string} reference reference designator (R1)
     * @param {?string} [value] value of component (1 kOhm)
     * @param {?string} [footprint] footprint (Resistor_SMD:R_0603_1608Metric)
     * @param {?Bounds} [position] position in schematic 
     * @example
     * ```ts
     * let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * ```
     */
    constructor({symbol, reference, value, footprint, xy}: IComponent = {}) {
        // nothing to do if no symbol passed
        if (!symbol) return;

        this.symbol = symbol;
        if (xy != undefined) {
            this.xy(xy.x, xy.y);
        } else {
            this.xy(Math.floor(Math.random() * 200), Math.floor(Math.random() * 200))
        }
        if (value != undefined) {
            this.Value = value;
        }
        if (reference != undefined) {
            this.Reference = reference;
        }
        if (footprint != undefined) {
            this.Footprint = footprint;
        }

        this.uuid = randomUUID();

    }


    /**
     * Returns a {@link Pin} object from the component
     * 
     * @param {(number | string)} number
     * @returns {Pin}
     * @example
     * ```ts
     * let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * resistor.pin(1);
     * ```
     */
    pin(number: number | string): Pin {
        return new Pin({ Number: number, Owner: this, type: 'passive' });
    }


    /**
     * Used internally
     * @ignore
     */
    update(): string {
        let component_props = [];

        if (this.dnp === true) return '';

        // add symbol-generics
        component_props.push([`lib_id "${this.symbol}"`]); // links to a lib_symbols item
        component_props.push([`at ${this.coord!.x} ${this.coord!.y} 0`]); // left/right up/down angle

        // add inherited properties
        Object.getOwnPropertyNames(this).forEach((val) => {
            if ((typeof this[val as keyof this] == "string") || (typeof this[val as keyof this] == "number")) {
                // ignore non-string|number properties
                component_props.push([
                    `property "${val}" "${this[val as keyof this]}"`,
                    [`at ${this.coord!.x + 5.08} ${this.coord!.y + 5.08} 0`],
                    [`effects`, [`hide yes`]],
                ]);
            }
        });

        // add instances s-expression, added in 8.0.5
        component_props.push([
            `instances`,
            [`project "${this.instance?.project}"`, [
                `path "/${this.instance?.uuid}" (reference "${this.Reference}") (unit 1)`
            ]],
            // [`effects`, [`hide yes`]],
        ]);

        let s = S.serialize(component_props, { includingRootParentheses: false });
        s = "(symbol " + s + ")";
        return s;
    }


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

            footprint_file_contents =footprint_file_contents.replaceAll('"', "`");

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
            console.log('- ', chalk.red.bold(`ERROR: footprint ${footprint} not found`))
        }

        return this.#footprint_file!;
    }

    /**
     * Used internally
     * @ignore
     */
    symbol_lib(symbol: string): string {
        // if we already found this symbol, return it before doing anything
        if (this.#symbol_lib != '') return this.#symbol_lib!;

        let symbol_file_contents = "";
        let symbol_file_name = symbol.split(":");
        let kicad_symbol: string = '';

        if (platform() == 'win32') {
            kicad_symbol = kicad_path + 'share/kicad/symbols';
        } else {
            kicad_symbol = kicad_path + 'symbols';
        }
        try {
            if (fs.existsSync(`${kicad_symbol}/${symbol_file_name[0]}.kicad_sym`)) {
                symbol_file_contents = fs.readFileSync(
                    `${kicad_symbol}/${symbol_file_name[0]}.kicad_sym`,
                    "utf8"
                );
            } else {
                symbol_file_contents = fs.readFileSync(
                    `./build/lib/${symbol_file_name[0]}.kicad_sym`,
                    "utf8"
                );
            }

            symbol_file_contents = symbol_file_contents.replaceAll('"', "`");

            const l = fsexp(symbol_file_contents).pop();

            // search through sym file for the symbol
            for (var i in l) {
                if (l[i][1] == `\`${symbol_file_name[1]}\``) {
                    // replace the name with the fqn
                    l[i][1] = `"${symbol_file_name[0]}:${symbol_file_name[1]}"`;
                    for (var ii in l[i]) {
                        if (l[i][ii][1] == '`Reference`') {

                            if (this.Reference == '') {
                                this.Reference = l[i][ii][2].replaceAll(`\``, "");
                            }
                        }

                        if (l[i][ii][1] == '`Value`') {
                            if (this.Value == '') {
                                this.Value = l[i][ii][2].replaceAll(`\``, "");
                            }
                        }

                        if (l[i][ii][1] == '`Datasheet`') {
                            if (this.Datasheet == '') {
                                this.Datasheet = l[i][ii][2].replaceAll(`\``, "");
                            }
                        }
                    }

                    // check if this is an 'extends' part
                    if (l[i][2][0] == "extends") {
                        // remove `
                        var extends_name = l[i][2][1].replaceAll(`\``, "");

                        // replace the name with the fqn
                        l[i][2][1] = `"${symbol_file_name[0]}:${extends_name}"`;
                        this.symbol = `${symbol_file_name[0]}:${extends_name}`;


                        return this.symbol_lib(`${symbol_file_name[0]}:${extends_name}`);
                    }

                    // replace ` with "
                    this.#symbol_lib = S.serialize(l[i]).replaceAll("`", '"');
                }
            }
        } catch (err) {
            console.error(err);
        }

        if (this.#symbol_lib == '') {
            console.log('- ', chalk.red.bold(`ERROR: symbol ${symbol} not found`))
        }

        return this.#symbol_lib!;
    }


    /**
     * Defines the component's X and Y location in the KiCAD Schematic file
     *
     * @param {number} x
     * @param {number} y
     */
    xy(x: number, y: number) {
        if (x == undefined) x = Math.floor(Math.random() * 100);
        if (y == undefined) y = Math.floor(Math.random() * 100);
        this.coord!.x = 2.54 * Math.ceil(x / 2.54);
        this.coord!.y = 2.54 * Math.ceil(y / 2.54);
    }

    
    /**
     * Creates a file listing the pinout of the component in `./pinout/[symbol name].md`
     */
    pinout() {
        let _footprint: string = '';
        let _datasheet: string = '';
        let _description: string = '';
        let _type: string = '';
        let _name: string = '';
        let _number: number = -1;
        let _symbol: string = '';
        let _markdown: string = '';

        let _pins: { type: string, name: string, number: number }[] = [];

        const l = fsexp(this.#symbol_lib).pop();
        for (var i in l) {
            for (var ii in l[i]) {
                if (l[i][ii] == 'Footprint') {
                    _footprint = l[i][parseInt(ii) + 1];
                }

                if (l[i][ii] == 'Datasheet') {
                    _datasheet = l[i][parseInt(ii) + 1];
                }

                if (l[i][ii] == 'Description') {
                    _description = l[i][parseInt(ii) + 1];
                }

                if (l[i][ii] == 'Value') {
                    _symbol = l[i][parseInt(ii) + 1];
                }

                if (l[i][ii][0] == "pin") {
                    _type = l[i][ii][1];
                    for (var iii in l[i][ii]) {
                        if (l[i][ii][iii][0] == "name") {
                            _name = l[i][ii][iii][1];
                        }
                        if (l[i][ii][iii][0] == "number") {
                            _number = l[i][ii][iii][1];
                        }
                    }
                    _pins.push({type: _type, name: _name, number: _number});
                }
            }
        }
        
        _markdown = `### ${_symbol}\n`;
        _markdown += `**${_description}*\n`
        _markdown += `- Datasheet: ${this.Datasheet}\n`;
        _markdown += `- Footprint: ${this.Footprint}\n\n`;
        _markdown += `| Pin # | Name | Type |\n`;
        _markdown += `| --: | :-- | :-- |\n`
        _pins.forEach((pin) => {
            _markdown += `| ${pin.number} | ${pin.name} | ${pin.type} |\n`;
        });

        try {
            if (!fs.existsSync('./build/pinout/')){
                fs.mkdirSync('./build/pinout/');
            }
            fs.writeFileSync(`./build/pinout/${_symbol}.md`, _markdown);
        } catch (err) {
            console.error(err);
        }
    }
}