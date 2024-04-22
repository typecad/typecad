import { Schematic } from "./schematic";
import { HierPin, Pin } from './pin'
import { Component } from ".";
import chalk from 'chalk';


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
            this.#Schematic.net(pin.Name, pin);
        });

        s += `)`;
        console.log(
            chalk.white("+"),
            chalk.red("sheet"),
            chalk.white.bold(this.#Sheetname)
        );
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
    create(...components: Component[]):boolean {
        this.#Schematic.sheet(this);
        super.create(...components);
        
        return true;
    }

    
    /**
     * Creates connections between a sheet and the schematic that holds it. A `hier` pin is the same as KiCAD's hierarchical sheet pin.
     *
     * @param {string} name
     * @param {...Pin[]} pins
     * @example
     * ```ts
     * let sheet = new Sheet('sheet', typecad);
     * let resistor = new Component("Device:R_Small", 'R1', '1 kOhm', "Resistor_SMD:R_0603_1608Metric");
     * sheet.hier('output', resistor.pin(1));
     * sheet.create(resistor);
     * ```
     */
    hier(name: string, ...pins: Pin[]) {
        let dup: boolean = false;
        pins.forEach((pin) => {
            pin.hier = true;
            pin.Name = name;
            this.#pins_list.forEach((_pin) => {
                if (pin.Name == _pin.Name){
                    dup = true;
                }
            });
            if (dup == false){
            this.#pins_list.push(pin); // add to sheet symbol pin list
            }
            super.net(name, pin);    // add hier pin in sheet
        });
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