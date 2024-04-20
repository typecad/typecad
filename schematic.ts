import fs from "node:fs";
import SExpr from "s-expression.js";
import chalk from 'chalk';
import fsexp from "fast-sexpr";
import { execSync } from "node:child_process";
import { expect } from "chai";
import { KiCodeTextBox } from '.'
import { Pin } from "./pin";
import { Sheet } from './sheet';
import { Component } from "./component";
import { kicad_cli_path } from './kicad'

const S = new SExpr()

/**
 * Used internally
 * @ignore
 */
export type NetList = { name: string, pins: Pin };


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
    #net_list: NetList[] = [];


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
    }


    /**
     * Adds a component to the schematic. Components can be added to the schematic through {@link create} as well. 
     * It can be useful for conditional builds where not all components will be known before {@link create} is called. 
     *
     * @param {...Component[]} components
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component("Device:R_Small", 'R1', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * let r2 = new Component("Device:R_Small", 'R2', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * typecad.add(r1, r2);
     * ```
     */
    add(...components: Component[]) {
        components.forEach((component) => {
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
     * let r1 = new Component("Device:R_Small", 'R1', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * let r2 = new Component("Device:R_Small", 'R2', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * typecad.create(r1, r2);
     * ```
     */
    create(...components: Component[]) {
        components.forEach((component) => {
            this.#component(component);
        });

        this.#schematic =
            '(kicad_sch(version 20231120)(generator "kicode")(generator_version "8.0")(paper "A4")';

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
            fs.writeFileSync(`${this.#Sheetname}.kicad_sch`, this.#schematic);
        } catch (err) {
            console.error(err);
        }


        this.#schematic = "";
        this.#symbol_libs = [];
        this.#symbols = [];
        this.#nets = [];
        this.#sheets = [];
        this.#boxes = [];

    }


    /**
     * Creates a KiCAD netlist file
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component("Device:R_Small", 'R1', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
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

        console.log(chalk.white("+"), chalk.cyan("netlist"));
        runCommand(`"${kicad_cli_path}" sch export netlist ${this.#Sheetname}.kicad_sch`)
    }


    /**
     * Connects a pin or group of pins into a together under a net
     *
     * @param {string} name
     * @param {...Pin[]} pins
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component("Device:R_Small", 'R1', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * let r2 = new Component("Device:R_Small", 'R2', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * typecad.net('vcc', r1.pin(1), r2,pin(1));
     * ```
     */
    net(name: string, ...pins: Pin[]) {
        pins.forEach((pin) => {
            var x: number = -1;
            var y: number = -1;
            var a: number = -1;
            var effects: string = "";

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
                                                a = parseFloat(l[i][ii][iiii][3]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (x == -1) {
                    console.log('- ', chalk.red.bold(`ERROR: pin ${pin.Number} of ${pin.Owner.symbol} not found`))
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
                // console.log(pin)
                this.#nets.push(
                    `(hierarchical_label "${pin.Name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y
                    } ${a})(shape ${pin.type}))`
                );
                console.log(
                    chalk.white("+"),
                    chalk.yellow("hier label"),
                    chalk.white.bold(pin.Name)
                );
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
                console.log(
                    chalk.white("+"),
                    chalk.blue("net label"),
                    chalk.white.bold(name)
                );
            }
        });
    }

    // /**
    //  * Used internally
    //  * @ignore
    //  */
    // #hier_pin(sheet_pin: Pin, ...pins: Pin[]) {
    //     var x = 0;
    //     var y = 0;
    //     var a = 0;
    //     var effects: string = "";

    //     pins.forEach((pin) => {
    //         if (pin.Owner != undefined) {
    //             const l = fsexp(pin.Owner.symbol_lib(pin.Owner.symbol)).pop();
    //             for (var i in l) {
    //                 for (var ii in l[i]) {
    //                     if (l[i][ii][0] == "pin") {
    //                         for (var iii in l[i][ii]) {
    //                             if (l[i][ii][iii][0] == "number") {
    //                                 if (l[i][ii][iii][1] == pin.Number) {
    //                                     for (var iiii in l[i][ii]) {
    //                                         if (l[i][ii][iiii][0] == "at") {
    //                                             x = parseFloat(l[i][ii][iiii][1]);
    //                                             y = parseFloat(l[i][ii][iiii][2]);
    //                                             a = parseFloat(l[i][ii][iiii][3]);
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //             // fix label direction
    //             switch (a) {
    //                 case 0:
    //                     a = 0;
    //                     effects = "(effects(justify right bottom))";
    //                     break;
    //                 case 180:
    //                     a = 0;
    //                     break;
    //                 case 90:
    //                     a = 0;
    //                     effects = "(effects(justify right top))";
    //                     break;
    //                 case 270:
    //                     a = 180;
    //                     break;
    //                 default:
    //                     break;
    //             }
    //             this.#nets.push(
    //                 `(hierarchical_label "${sheet_pin.Name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y
    //                 } ${a})(shape ${sheet_pin.type})${effects})`
    //             );
    //             console.log(
    //                 chalk.white("+"),
    //                 chalk.yellow("hier label"),
    //                 chalk.white.bold(pin.Name)
    //             );
    //             if (pin.hier == true) {
    //                 this.#nets.push(
    //                     `(hierarchical_label "${pin.Name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y
    //                     } ${a})(shape ${pin.type})${effects})`
    //                 );
    //                 console.log(
    //                     chalk.white("+"),
    //                     chalk.yellow("hier label"),
    //                     chalk.white.bold(pin.Name)
    //                 );
    //             }
    //         }
    //     });
    // }

    
    /**
     * Add a no-connection flag to a pin
     *
     * @param {...Pin[]} pins
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Resistor('R1', '10 kOhm');
     * typecad.dnc(r1.pin(1));
     * ```
     */
    dnc(...pins: Pin[]) {
        pins.forEach((pin) => {
            var x: number = -1;
            var y: number = -1;

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
                    console.log('- ', chalk.red.bold(`ERROR: pin ${pin.Number} of ${pin.Owner.symbol} not found`))
                }
            }

            this.#dnc.push(
                `(no_connect (at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y}))`
            );
            console.log(
                chalk.white("+"),
                chalk.gray("dnc")
            );

        });
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

            console.log(chalk.white("+"), chalk.gray("box"));
        });
    }

    /**
     * Used internally
     * @ignore
     */
    #component(component: Component) {
        this.#symbol_libs.push(component.symbol_lib(component.symbol));      // has to be before next line to get the right references and 
        this.#symbols.push(component.update());
        console.log(chalk.white("+"), chalk.green("component"), chalk.white.bold(component.symbol));
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