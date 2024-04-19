import { Bounds } from "./bounds";
import { Pin } from "./pin";
import SExpr from "s-expression.js";
import fs from "node:fs";
import fsexp from "fast-sexpr";
import chalk from 'chalk';
import { kicad_path } from "./kicad";
import { platform } from 'node:os';

// const kicad_symbol = "C:/Program Files/KiCad/8.0/share/kicad/symbols"
const S = new SExpr()

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
 */
export class Component {
    Footprint?:string;
    symbol: string;
    coord? = { x: 0, y: 0 };
    Reference?:string;
    Value:string = '';
    Datasheet?: string;
    Description?: string;
    MPN?: string;
    uuid?: string;

    /**
     * `constructor` for Component.
     *
     * @constructor
     * @param {string} symbol for the component ie. Device:R_Small
     * @param {string} reference
     * @param {?string} [value]
     * @param {?string} [footprint]
     * @param {?Bounds} [position]
     * @example
     * ```ts
     * let resistor = new Component("Device:R_Small", 'R1', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * ```
     */
    constructor(symbol: string, reference?: string, value?: string, footprint?: string, position?: Bounds) {
        this.symbol = symbol;
        if (position != undefined) {
            this.xy(position.x, position.y);
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
    }

    
    /**
     * Returns a {@link Pin} object from the component
     * 
     * @param {(number | string)} number
     * @returns {Pin}
     * @example
     * ```ts
     * let resistor = new Component("Device:R_Small", 'R1', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
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

        let s = S.serialize(component_props, { includingRootParentheses: false });
        s = "(symbol " + s + ")";
        return s;
    }

    
    /**
     * Used internally
     * @ignore
     */
    symbol_lib(symbol: string): string {
        let symbol_file_contents = "";
        let symbol_file_name = symbol.split(":");
        let symbol_lib = '';
        let kicad_symbol:string = '';

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
                    `./lib/${symbol_file_name[0]}.kicad_sym`,
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
                    symbol_lib = S.serialize(l[i]).replaceAll("`", '"');
                }
            }
        } catch (err) {
            console.error(err);
        }

        if (symbol_lib == '') {
            // try in project folder

            console.log('- ', chalk.red.bold(`ERROR: symbol ${symbol} not found`))
        }

        return symbol_lib;
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
}