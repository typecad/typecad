import fs from "node:fs";
// import SExpr from "s-expression.js";
import chalk from 'chalk';
import fsexp from "fast-sexpr";
import { execSync } from "node:child_process";
import { KiCodeTextBox } from '.'
import { Pin } from "./pin";
import { Sheet } from './sheet';
import { Component } from "./component";
import { kicad_cli_path } from './kicad'
import { randomUUID, UUID } from "node:crypto";

//const S = new SExpr()
/**
 * Used internally
 * @ignore
 */
export type NetList = { name: string, pins: Pin };

let symbols: string[] = ['▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟']
const getRandomElement = () =>
    symbols.length ? symbols[Math.floor(Math.random() * symbols.length)] : undefined

export interface INet {
    net?: string,
    pins?: Pin[],
}

/**
 * The main class for typeCAD. Holds all {@link Component} and {@link Sheet} classes, creates work files, and creates nets. 
 *
 * @export
 * @class Schematic
 * @typedef {Schematic}
 */
export class Schematic {
    #Sheetname: string;
    #schematic: string = '';
    #symbols: string[] = []; // all the components
    #symbol_libs: string[] = []; // all the symbol libs
    #nets: string[] = []; // all the nets
    #sheets: string[] = [];
    #boxes: string[] = [];
    #dnc: string[] = [];
    uuid: UUID;

    /**
     * `constructor` for Schematic
     *
     * @constructor
     * @param {string} Sheetname Name and filename of generated files
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * ```
     */
    constructor(Sheetname: string) {
        this.#Sheetname = Sheetname;
        this.uuid = randomUUID();
    }

    /**
     * Used internally
     * @ignore
     */
    getUUID() {
        return this.uuid;
    }

    /**
     * Used internally
     * @ignore
     */
    getProject() {
        return this.#Sheetname;
    }
    /**
     * Adds a component to the schematic. Components can be added to the schematic through {@link create} as well. 
     * It can be useful for conditional builds where not all components will be known before {@link create} is called. 
     *
     * @param {...Component[]} components
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * let r2 = new Component({symbol: "Device:R_Small", reference: 'R2', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * typecad.add(r1, r2);
     * ```
     */
    add(...components: Component[]) {
        components.forEach((component) => {
            component.instance!.project = this.#Sheetname;
            component.instance!.uuid = this.uuid
            this.#component(component);
        });
    }

    /**
     * Creates schematic files
     *
     * @param {...Component[]} components All the components to be included in the schematic
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * let r2 = new Component({symbol: "Device:R_Small", reference: 'R2', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * typecad.create(r1, r2);
     * ```
     */
    create(...components: Component[]): boolean {
        components.forEach((component) => {
            if (this.constructor.name == 'Schematic') {
                component.instance!.project = this.#Sheetname;
                component.instance!.uuid = this.uuid
            }
            this.#component(component);
        });

        this.#schematic =
            `(kicad_sch(version 20231120)(generator "typecad")(generator_version "1.0")(paper "A4")(uuid "${this.uuid}")`;

        this.#schematic += "(lib_symbols"
        for (var i in this.#symbol_libs) {
            this.#schematic += this.#symbol_libs[i];
        }
        this.#schematic += ")";

        for (var i in this.#symbols) {
            this.#schematic += this.#symbols[i];
        }
        for (var i in this.#nets) {
            this.#schematic += this.#nets[i];
        }
        for (var i in this.#sheets) {
            this.#schematic += this.#sheets[i];
        }
        for (var i in this.#boxes) {
            this.#schematic += this.#boxes[i];
        }
        for (var i in this.#dnc) {
            this.#schematic += this.#dnc[i];
        }

        this.#schematic += '(sheet_instances(path "/"(page "1"))))';
        try {
            fs.writeFileSync(`./build/${this.#Sheetname}.kicad_sch`, this.#schematic);
        } catch (err) {
            console.error(err);
            return false;
        }


        this.#schematic = "";
        this.#symbol_libs = [];
        this.#symbols = [];
        this.#nets = [];
        this.#sheets = [];
        this.#boxes = [];
        return true;
    }


    /**
     * Creates a KiCAD netlist file
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({ symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm' });
     * typecad.create(r1);
     * typecad.netlist();
     * ```
     */
    netlist() {
        const runCommand = (command: string) => {
            try {
                execSync(`${command}`, { stdio: "inherit" });
            } catch (e) {
                console.error(`Failed executing ${command}`, e);
                return false;
            }
            return true;
        };

        process.stdout.write(chalk.white("\n+"));
        process.stdout.write(chalk.cyan("netlist"));
        runCommand(`"${kicad_cli_path}" sch export netlist --output ./build/${this.#Sheetname}.net ./build/${this.#Sheetname}.kicad_sch`)
    }

    /**
     * Creates a CSV BOM for the schematic
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({ symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm' });
     * typecad.create(r1);
     * typecad.bom();
     * ```
     */
    bom() {
        const runCommand = (command: string) => {
            try {
                execSync(`${command}`, { stdio: "inherit" });
            } catch (e) {
                console.error(`Failed executing ${command}`, e);
                return false;
            }
            return true;
        };

        process.stdout.write(chalk.white("\n+"));
        process.stdout.write(chalk.red("bom"));
        runCommand(`"${kicad_cli_path}" sch export bom --fields "*" --output ./build/${this.#Sheetname}.csv ./build/${this.#Sheetname}.kicad_sch`)
    }

    /**
     * Runs KiCAD's schematic Electric Rules Checker. Process exits with `1` if errors are found. Run this after a schematic is created.
     */
    erc(show_all: boolean = false): boolean {
        let erc_failed: boolean = false;
        const runCommand = (command: string) => {
            try {
                execSync(`${command}`);
            } catch (e) {

            }
            return true;
        };

        process.stdout.write(chalk.white("\n+"));
        process.stdout.write(chalk.magenta("erc - " + this.#Sheetname));

        runCommand(`"${kicad_cli_path}" sch erc --exit-code-violations --output ./build/${this.#Sheetname}.json --format json ./build/${this.#Sheetname}.kicad_sch`);

        if (fs.existsSync(`./build/${this.#Sheetname}.json`)) {
            let erc_results_text = fs.readFileSync(
                `./build/${this.#Sheetname}.json`,
                "utf8"
            );

            let erc_results = JSON.parse(erc_results_text);

            for (let k in erc_results.sheets[0].violations) {
                if (erc_results.sheets[0].violations[k].severity == 'error') {
                    erc_failed = true;
                    console.log(
                        chalk.white(" -"),
                        chalk.red("ERROR"),
                        chalk.white.bold(erc_results.sheets[0].violations[k].type),
                        ':',
                        chalk.white(erc_results.sheets[0].violations[k].items[0].description)
                    );
                }

                if (show_all) {
                    if (erc_results.sheets[0].violations[k].severity == 'warning') {
                        console.log(
                            chalk.white(" -"),
                            chalk.yellow("WARN"),
                            chalk.white.bold(erc_results.sheets[0].violations[k].type),
                            ':',
                            chalk.white(erc_results.sheets[0].violations[k].items[0].description)
                        );
                    }
                }
            }
        }


        if (erc_failed == true) {
            process.exit(1);
            return false;
        }
        return true;
    }

    /**
     * Connects a pin or group of pins together
     *
     * @param {{net?: string, pins?: Pin[]}} {net?: string, pins?: Pin[]}
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * let r2 = new Component({symbol: "Device:R_Small", reference: 'R2', value: '4.7 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * 
     * // named net
     * typecad.net({ net: 'vcc', pins: [r1.pin(1), r2,pin(1)] });
     * 
     * // unnamed net
     * typecad.net({ pins: [r1.pin(2), r2,pin(1)] });
     * ```
     */
    net({ net, pins }: INet = {}): boolean {
        // nothing to do if no pins passed
        if (!pins) {
            return false;
        }

        if (net) {
            // if a net was passed, use that
            return this._net(net, ...pins);
        }
        else {
            // if no net passed, create a name for a net
            let net_name;

            for (let i = 0; i < pins.length; i++) {
                if (pins[i].Name) {
                    net_name = pins[i].Name + '.' + pins[0].Owner.Reference;
                    break;
                }
            }

            if (net_name == undefined) {
                net_name = pins[0].Owner.Reference + '.' + pins[0].Number;
            }
            return this._net(net_name, ...pins);
        }
    }

    /**
     * Used internally
     * @ignore
     */
    _net(name: string, ...pins: Pin[]): boolean {
        let err: boolean = false;

        pins.forEach((pin) => {
            var x: number = -1;
            var y: number = -1;
            var a: number = -1;
            var effects: string = "";

            // check that the information needed for the pin is there
            if (pin == undefined) {
                console.log('\n- ', chalk.red.bold('ERROR: pin is malformed (undefined)'));
                err = true;
                return false;
            }

            if ("Owner" in pin == false || "Number" in pin == false) {
                console.log('\n- ', chalk.red.bold('ERROR: pin is malformed (missing Owner or Number)'));
                err = true;
                return false;
            }

            // determine pin locations if there is an owner (symbol associated)
            // there are a couple variations of the s-expressions
            if (pin.Owner != undefined) {
                const l = fsexp(pin.Owner.symbol_lib(pin.Owner.symbol)).pop();
                for (var i in l) {
                    for (var ii in l[i]) {
                        if (l[i][0] == "pin") {
                            for (var iii in l[i][ii]) {
                                if (l[i][ii][0] == "number") {
                                    if (l[i][ii][1] == pin.Number) {
                                        for (var iiii in l[i][ii]) {
                                            if (l[i][3][0] == "at") {
                                                x = parseFloat(l[i][3][1]);
                                                y = parseFloat(l[i][3][2]);
                                                a = parseFloat(l[i][3][1]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // didn't find pins on the first format, try this one
                if (x == -1) {
                    for (var i in l) {
                        for (var ii in l[i]) {
                            if (l[i][ii][0] == "pin") {
                                for (var iii in l[i][ii]) {
                                    if (l[i][ii][iii][0] == "number") {
                                        if (l[i][ii][iii][1] == pin.Number) {
                                            for (var iiii in l[i][ii]) {
                                                if (l[i][ii][iiii][0] == "at") {
                                                    x = parseFloat(l[i][ii][iiii][1]);
                                                    y = parseFloat(l[i][ii][iiii][2]);
                                                    a = parseFloat(l[i][ii][iiii][3]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (x == -1) {
                    console.log('\n- ', chalk.red.bold(`ERROR: pin ${pin.Number} of ${pin.Owner.symbol} not found`));
                    err = true;
                }
                // fix label direction
                switch (a) {
                    case 0:
                        a = 0;
                        effects = "(effects(justify right bottom))";
                        break;
                    case 180:
                        a = 0;
                        break;
                    case 90:
                        a = 0;
                        effects = "(effects(justify right top))";
                        break;
                    case 270:
                        a = 180;
                        break;
                    default:
                        break;
                }
            }

            if (pin.hier == true) {
                // check that the information needed for the pin is there
                if ("Name" in pin == false) {
                    console.log('\n- ', chalk.red.bold('ERROR: pin passed is malformed (missing Name)'));
                    err = true;
                    return false;
                }
                this.#nets.push(
                    `(hierarchical_label "${pin.Name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y
                    } ${a})(shape ${pin.type})  ${effects})`
                );
                process.stdout.write(chalk.yellow(getRandomElement()));
            }
            else if (pin.sheet == true) {
                this.#nets.push(
                    `(label "${name}"(at ${pin.x} ${(pin.y + (pin.order * 2.54))
                    } 180) (effects(justify right top)))`
                );
            }
            else {
                this.#nets.push(
                    `(label "${name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y
                    } ${a}) ${effects})`
                );
                process.stdout.write(chalk.blue(getRandomElement()));
            }
        });
        if (err) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Add a no-connection flag to a pin
     *
     * @param {...Pin[]} pins
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Resistor({ symbol: "Device:R_Small", reference: 'R1' });
     * typecad.dnc(r1.pin(1));
     * ```
     */
    dnc(...pins: Pin[]): boolean {
        let err: boolean = false;

        pins.forEach((pin) => {
            var x: number = -1;
            var y: number = -1;

            // check that the information needed for the pin is there
            if ("Owner" in pin == false || "Number" in pin == false) {
                console.log('\n- ', chalk.red.bold('ERROR: pin passed for DNC is malformed (missing Owner or Number)'));
                err = true;
                return false;
            }

            // determine pin locations if there is an owner (symbol associated)
            if (pin.Owner != undefined) {
                const l = fsexp(pin.Owner.symbol_lib(pin.Owner.symbol)).pop();
                for (var i in l) {
                    for (var ii in l[i]) {
                        if (l[i][ii][0] == "pin") {
                            for (var iii in l[i][ii]) {
                                if (l[i][ii][iii][0] == "number") {
                                    if (l[i][ii][iii][1] == pin.Number) {
                                        for (var iiii in l[i][ii]) {
                                            if (l[i][ii][iiii][0] == "at") {
                                                x = parseFloat(l[i][ii][iiii][1]);
                                                y = parseFloat(l[i][ii][iiii][2]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (x == -1) {
                    for (var i in l) {
                        for (var ii in l[i]) {
                            if (l[i][0] == "pin") {
                                for (var iii in l[i][ii]) {
                                    if (l[i][ii][0] == "number") {
                                        if (l[i][ii][1] == pin.Number) {
                                            for (var iiii in l[i][ii]) {
                                                if (l[i][3][0] == "at") {
                                                    x = parseFloat(l[i][3][1]);
                                                    y = parseFloat(l[i][3][2]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (x == -1) {
                    console.log('\n- ', chalk.red.bold(`ERROR: pin ${pin.Number} of ${pin.Owner.symbol} not found`));
                    err = true;
                }
            }

            this.#dnc.push(
                `(no_connect (at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y}))`
            );
            process.stdout.write(chalk.gray(getRandomElement()));

        });
        if (err) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Creates a box in the schematic file. 
     *
     * @param {...KiCodeTextBox[]} box_object
     */
    box(...box_object: KiCodeTextBox[]) {
        box_object.forEach((box) => {
            this.#boxes.push(
                `(text_box "${box.name}"(at ${box.x} ${box.y} 0)(size ${box.width} ${box.height})(stroke(width ${box.border_width})
            (type default)(color ${box.border_color.r} ${box.border_color.g} ${box.border_color.b} ${box.border_color.a}))
            (fill(type color)(color ${box.background.r} ${box.background.g} ${box.background.b} ${box.background.a}))
            (effects(font(size ${box.font.size} ${box.font.size})(color ${box.font.color.r} ${box.font.color.g} ${box.font.color.b} ${box.font.color.a})(bold ${box.font.bold})(italic ${box.font.italic}))(justify ${box.justify}))
            )`
            );

            process.stdout.write(chalk.white(getRandomElement()));
        });
    }

    /**
     * Used internally
     * @ignore
     */
    #component(component: Component) {
        if (component.symbol_lib == undefined) return;
        if (!component.symbol) return;
        this.#symbol_libs.push(component.symbol_lib(component.symbol));      // has to be before next line to get the right references 
        
        this.#symbols.push(component.update());

        process.stdout.write(chalk.greenBright(getRandomElement()));
    }

    /**
     * Creates a new sheet in the schematic. The same as KiCAD's hierarchical sheet. 
     *```ts
     * let typecad = new Schematic('sheetname');
     * let sheet = new Sheet('sheet', typecad);
     * ```
     * @param {Sheet} sheet
     */
    sheet(sheet: Sheet) {
        this.#sheets.push(sheet.add())
    }
}