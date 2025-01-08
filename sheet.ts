import { Schematic, INet } from "./schematic";
import { HierPin, Pin } from './pin'
import { Component } from ".";
import { randomUUID, UUID } from "node:crypto";

import chalk from 'chalk';

let symbols: string[] = ['▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟']
const getRandomElement = () =>
    symbols.length ? symbols[Math.floor(Math.random() * symbols.length)] : undefined

/**
 * Adds a new sheet in the schematic. The same as KiCAD's hierarchical sheet. 
 *
 * @export
 * @class Sheet
 * @typedef {Sheet}
 * @extends {Schematic}
 */
export class Sheet extends Schematic {
    #coord = { x: 0, y: 0 };
    #pin_list: HierPin[] = [];
    #pins_list: Pin[] = [];
    #Sheetname;
    #Schematic: Schematic;
    uuid: UUID;


    /**
     * `constructor` for Sheet`
     *
     * @constructor
     * @param {string} name The name of the sheet
     * @param {Schematic} owner The {@link Schematic} the sheet is created in
     * @param {?number} [x] X position of sheet in the schematic file
     * @param {?number} [y] Y position of sheet in the schematic file
     */
    constructor(name: string, owner: Schematic, x?: number, y?: number) {
        super(name);
        if ((x != undefined) && (y != undefined)) {
            this.xy(x, y);
        } else {
            this.xy(Math.floor(Math.random() * 200), Math.floor(Math.random() * 200))
        }
        this.#Sheetname = name;
        this.#Schematic = owner;
        this.uuid = randomUUID();

        // pins.forEach((pin) => {
        //     this.#pins_list.push(pin);
        // });

    }


    /**
     * Defines the sheet's X and Y location in the KiCAD Schematic file
     *
     * @param {number} x
     * @param {number} y
     */
    xy(x: number, y: number) {
        this.#coord.x = 2.54 * Math.ceil(x / 2.54);
        this.#coord.y = 2.54 * Math.ceil(y / 2.54);
    }


    /**
     * Used internally
     * @ignore
     */
    add() {
        let pins_in_sheet = 1;      // start at one for buffer space
        this.#pins_list.forEach((pin, index) => {
            pins_in_sheet++;
        });

        var s = "";
        s += `(sheet(at ${this.#coord.x} ${this.#coord.y})(size 20 ${pins_in_sheet * 2.54})\n`;
        s += `(property "Sheetname" "${this.#Sheetname}"(at ${this.#coord.x} ${this.#coord.y} 0)(effects(font(size 1.27 1.27))(justify left bottom)))\n`;
        s += `(uuid "${this.uuid}")`
        s += `(property "Sheetfile" "${this.#Sheetname}.kicad_sch"(at ${this.#coord.x - 13
            } ${this.#coord.y
            } 0)(effects(hide yes)(font(size 1.27 1.27))(justify left top)))\n`;

        // add the pins inside the hier sheet
        let count = 0;
        let pins_to_sheet = [...this.#pins_list]
        this.#pins_list.forEach((pin, index) => {
            count++;
            this.#pins_list[index].x = this.#coord.x;
            this.#pins_list[index].y = this.#coord.y + (count * 2.54);
            pin.order = count;

            s += `(pin "${pin.Name}" ${pin.type}(at ${this.#coord.x} ${this.#coord.y + (count * 2.54)} ${pin.a}))`;
        });

        // add the pins connecting the sheet pins to the rest of the schematic
        count = 0;
        pins_to_sheet.forEach((pin, index) => {
            count++;
            pin.hier = false;
            pin.sheet = true;
            pin.x = this.#coord.x;
            pin.y = this.#coord.y;
            this.#Schematic._net(pin.Name, pin);
        });

        s += `)`;

        process.stdout.write(chalk.red(getRandomElement()));
        return s;
    }


    /**
     * Creates the sheet with all the passed components
     *
     * @param {...Component[]} components
     * @example
     * ```ts
     * let sheet = new Sheet('sheet', typecad);
     * let resistor = new Component("Device:R_Small", 'R1', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * sheet.create(resistor);
     * ```
     */
    create(...components: Component[]): boolean {
        this.#Schematic.sheet(this);

        components.forEach((component) => {
            component.instance!.project = this.#Schematic.getProject();
            component.instance!.uuid = (this.#Schematic.uuid + "/" + this.uuid);

            // console.log('sheet.create', component)

            // console.log(component.instance)
        });

        super.create(...components);

        return true;
    }

    ext(net: string, ...pins: Pin[]) {
        if (!pins) {
            return;
        }
        if (!net) {
            return;
        }

        pins.forEach((pin) => {
            pin.hier = true;
            pin.type = "output"
        });
        this._net(net, ...pins);
    }

    /**
     * Used internally
     * @ignore
     */
    _net(name: string, ...pins: Pin[]): boolean {
        let dup: boolean = false;
        let err: boolean = false;
        pins.forEach((pin) => {

            // check that the information needed for the pin is there
            // if ("Name" in pin == false) {
            //     console.log('- ', chalk.red.bold('ERROR: pin passed for DNC is malformed (missing Owner or Number)'));
            //     err = false;
            //     return false;
            // }

            //pin.hier = true;
            pin.Name = name;
            this.#pins_list.forEach((_pin) => {
                if (pin.Name == _pin.Name) {
                    dup = true;
                }
            });
            if (dup == false) {
                if (pin.hier == true) {
                    this.#pins_list.push(pin); // add to sheet symbol pin list
                }
            }
            super._net(name, pin);    // add hier pin in sheet
        });

        if (err) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Used internally
     * @ignore
     */
    pin(pin_name: string): Pin {
        let found_index: number = -1;
        this.#pins_list.forEach((pin, index) => {
            if (pin.Name == pin_name) {
                found_index = index;
            }
        });
        return this.#pins_list[found_index]
    }
}