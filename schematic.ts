import { Component, IComponent } from "./component";
import { Pin } from "./pin";
import fs from "node:fs";
import Handlebars from "handlebars";
import chalk from 'chalk';
import { erc } from "./erc";

let schematic_template = `(export (version "E")
  (design
    (tool "typeCAD 0.0.30"))
  (components
    {{#each components}}
    {{this}}
    {{/each}})
  (nets
  {{#each nets}}
    {{this}}
    {{/each}}
))
`;

let comp_template = `(comp 
      (ref \"{{reference}}\")
        (value \"{{value}}\")
        (footprint \"{{footprint}}\")
        (fields
        {{#if footprint}}
          (field (name \"Footprint\") \"{{footprint}}\")
        {{/if}}
        {{#if datasheet}}
          (field (name \"Datasheet\")\"{{datasheet}}\")
        {{/if}}
        {{#if description}}
          (field (name \"Description\")\"{{description}}\")
        {{/if}}
        {{#if voltage}}
          (field (name \"Voltage\")"{{voltage}}")
        {{/if}}
        {{#if wattage}}
          (field (name \"Wattage\")"{{wattage}}")
        {{/if}}
        {{#if mpn}}
          (field (name \"MPN\")"{{mpn}}")
        {{/if}}
        )
    )`;

let nets_template = `{{#each nets}}
(net (code "{{code}}") (name "{{name}}")
{{#each nodes}}
        (node (ref "{{this.reference}}") (pin "{{this.number}}") (pintype "{{this.type}}"))
{{/each}}
)
{{/each}}`;

function deepFreeze<T>(obj: T): Readonly<T> {
    if (typeof obj !== 'object' || obj === null) {
        return obj; // Not an object, no need to freeze
    }

    Object.keys(obj).forEach(key => {
        const value = obj[key as keyof T];
        if (typeof value === 'object' && value !== null) {
            deepFreeze(value); // Recursively freeze nested objects
        }
    });

    return Object.freeze(obj);
}

/**
 * The main class for typeCAD. Holds all {@link Component} clases, creates work files, and creates nets. 
 *
 * @export
 * @class Schematic
 * @typedef {Schematic}
 */
export class Schematic {
    Components: Component[] = [];
    Sheetname: string = '';
    private sxexp_components: string[] = [];
    private sxexp_nets: string[] = [];
    private code_counter = 0;
    Nodes: { name: string | undefined, code: number, nodes: Pin[] }[] = [];
    private _chained_name: string = '';

    /**
     * Used internally
     * @ignore
     */
    private _storeNetParams(name: string | undefined, code: number, ...nodes: Pin[]) {
        this.Nodes.push({ name, code, nodes });
    }

    bom() {
        let bom: string = '';
        bom += 'Reference,Value,Datasheet,Footprint,MPN\n';
        this.Components.forEach(component => {
            bom += `${component.reference},${component.value},${component.datasheet},${component.footprint},${component.mpn}\n`;
        });

        try {
            fs.writeFileSync(`./build/${this.Sheetname}.csv`, bom);

            // console.log(`  🔣 Schematic: ${this.Sheetname}`)
            process.stdout.write(chalk.cyan.bold(`./build/${this.Sheetname}.csv`) + ` BOM written` + '\n');
        } catch (err) {
            console.error(err);
            return false;
        }

    }
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
        this.Sheetname = Sheetname;
    }

    // return same type of Component as passed
    // add<T extends Component>(component: T): T {
    //     this.Components.push(component);
    //     let template = Handlebars.compile(comp_template);
    //     let comp_data: IComponent = { reference: component.reference, value: component.value, footprint: component.footprint };
    //     if (component.wattage) {
    //         comp_data.wattage = component.wattage;
    //     }
    //     if (component.voltage) {
    //         comp_data.voltage = component.voltage;
    //     }
    //     if (component.datasheet) {
    //         comp_data.datasheet = component.datasheet;
    //     }
    //     if (component.description) {
    //         comp_data.description = component.description;
    //     }
    //     let _comp = template(comp_data);
    //     this.sxexp_components.push(_comp);

    //     // Object.freeze(component.value);
    //     return component;
    // }

    /**
     * Adds a component to the schematic.
     *
     * @param {...Component[]} components
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({});
     * let r2 = new Component({});
     * typecad.add(r1, r2);
     * ```
     */
    add(...components: Component[]) {
        components.forEach(component => {
            if (component.dnp === true) {
                return;
            }
            this.Components.push(component);
            let template = Handlebars.compile(comp_template);
            let comp_data: IComponent = { reference: component.reference, value: component.value, footprint: component.footprint };
            if (component.wattage) {
                comp_data.wattage = component.wattage;
            }
            if (component.voltage) {
                comp_data.voltage = component.voltage;
            }
            if (component.datasheet) {
                comp_data.datasheet = component.datasheet;
            }
            if (component.description) {
                comp_data.description = component.description;
            }
            if (component.mpn) {
                comp_data.mpn = component.mpn;
            }
            let _comp = template(comp_data);
            this.sxexp_components.push(_comp);
            //console.log(`  🧩  ${component.reference} added`);
            process.stdout.write(chalk.blue.bold(component.reference) + ' added\n');

            // deepFreeze(component);
        });
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
    dnc(...pins: Pin[]) {
        pins.forEach((pin) => {
            pin.type = 'no_connect';
            this.net(pin)
        });
    }

    /**
     * Connects a group of pins together
     *
     * @param {{pins: Pin[]}} pins: Pin[]}
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({});
     * let r2 = new Component({});
     * 
     * // named net
     * typecad.named('vin').net(r1.pin(1), r2.pin(1));
     * 
     * // unnamed net
     * typecad.net(r1.pin(1), r2.pin(1));
     * ```
     */
    named(name: string) {
        this._chained_name = name;
        return this;
    }

    /**
     * Connects a group of pins together
     *
     * @param {{pins: Pin[]}} pins: Pin[]}
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({});
     * let r2 = new Component({});
     * 
     * // named net
     * typecad.named('vin').net(r1.pin(1), r2.pin(1));
     * 
     * // unnamed net
     * typecad.net(r1.pin(1), r2.pin(1));
     * ```
     */
    net(...pins: Pin[]) {
        this.code_counter++;
        let match: boolean = false;

        // make a net name
        let node_name = this._chained_name ? this._chained_name : `net${this.code_counter}`;

        // Check for existing net parameters and copy pins to existing net
        // KiCAD won't connect the same pin to a different net
        pins.forEach((pin) => {
            this.Nodes.forEach((netParam) => {
                netParam.nodes.forEach((netParamPin, index) => {
                    if (netParamPin.reference === pin.reference && netParamPin.number === pin.number) {
                        if (this._chained_name) {
                            process.stdout.write(chalk.gray.bold(`${this._chained_name}`) + ` net merged into ` + netParam.name + '\n');
                        }
                        match = true;
                        netParam.nodes.push(...pins.filter(p => p !== pin));
                    }
                });
            });
        });

        // Remove duplicate pins
        this.Nodes.forEach((netParam) => {
            netParam.nodes = netParam.nodes.filter((pin, index, self) =>
                index === self.findIndex((p) => (
                    p.reference === pin.reference && p.number === pin.number
                ))
            );
        });

        // if there was a match above, no need to add a new node
        if (match) {
            return;
        }

        // store the node
        this._storeNetParams(node_name, this.code_counter, ...pins);

        // clear the name
        this._chained_name = '';
        // console.log(`  ➰  net ${node_name}`)

        let _net_display = '';
        pins.forEach((pin) => {
            _net_display += '~ ' + pin.reference + ':' + pin.number + ' ';
        });

        process.stdout.write(chalk.gray.bold(`${node_name}`) + ` net added ` + _net_display + '\n');

        //return this;
    }

    /**
     * Used internally
     * @ignore
    */
    private make_sexp_net() {
        // create the entire net list sexp from the netNodes array
        let template = Handlebars.compile(nets_template);
        let _nets = template({ nets: this.Nodes });

        this.sxexp_nets.push(_nets);
    }

    /**
     * Creates schematic files
     *
     * @param {...Component[]} components All the components to be included in the schematic
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({});
     * let r2 = new Component({});
     * typecad.create(r1, r2);
     * ```
     */
    create(...component: Component[]) {
        component.forEach((component) => {
            this.add(component);
        });

        this.make_sexp_net();
        let template = Handlebars.compile(schematic_template, { noEscape: true });
        let schematic_data = { components: this.sxexp_components, nets: this.sxexp_nets };
        let _schematic = template(schematic_data);

        try {
            fs.writeFileSync(`./build/${this.Sheetname}.net`, _schematic);

            // console.log(`  🔣 Schematic: ${this.Sheetname}`)
            process.stdout.write(chalk.red.bold(`./build/${this.Sheetname}.net`) + ` file written` + '\n');

            // console.log(`🏁 finished`)
            process.stdout.write('🏁 ' + chalk.whiteBright.bold('type') + 'CAD finished' + '\n');

        } catch (err) {
            console.error(err);
            return false;
        }
    }

    erc() {
        erc(this);      // call it this way to make it easy to create a "plugin"-type extension for this
    }
}