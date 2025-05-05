import { Component, IComponent } from "./component";
import { Pin } from "./pin";
import fs from "node:fs";
import Handlebars from "handlebars";
import chalk from 'chalk';
import { erc } from "./erc";
import { randomUUID, UUID } from "node:crypto";

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

/**
 * Recursively freezes an object to make it immutable.
 *
 * @template T
 * @param {T} obj - The object to freeze.
 * @returns {Readonly<T>} - The frozen object.
 * @ignore
 */
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
 * Type representing available BOM fields.
 */
export type BomField = 
    | 'Reference'
    | 'Value'
    | 'Datasheet'
    | 'Footprint'
    | 'MPN'
    | 'Description'
    | 'Voltage'
    | 'Wattage';

/**
 * Interface representing Schematic options.
 * 
 * @interface ISchematicOptions
 * @property {string} net_prefix - Prefix for auto-generated net names. Defaults to 'net'.
 * @property {BomField[]} bom_fields - Fields to include in BOM. Defaults to ['Reference', 'Value', 'Datasheet', 'Footprint', 'MPN'].
 * @property {string} bom_separator - Separator for BOM CSV. Defaults to ','.
 */
export interface ISchematicOptions {
    net_prefix: string;
    bom_fields: BomField[];
    bom_separator: string;
}

/**
 * The main class for typeCAD. Holds all {@link Component} classes, creates work files, and creates nets.
 *
 * @export
 * @class Schematic
 * @typedef {Schematic}
 */
export class Schematic {
    Components: Component[] = [];
    Sheetname: string = '';
    uuid: UUID = randomUUID();
    private sxexp_components: string[] = [];
    private sxexp_nets: string[] = [];
    private code_counter = 0;
    Nodes: { name: string, code: number, nodes: Pin[], owner: Component | null }[] = [];
    merged_nets: { old_name: string, merged_to_number: number}[] = [];
    private _chained_name: string = '';
    #options: ISchematicOptions = {
        net_prefix: 'net',
        bom_fields: ['Reference', 'Value', 'Datasheet', 'Footprint', 'MPN'],
        bom_separator: ','
    };

    /**
     * Getter for Schematic options.
     * 
     * @example
     * ```ts
     * let schematic = new Schematic('sheetname');
     * schematic.option.safe_write = false;
     * schematic.option.build_dir = './custom_build/';
     * ```
     */
    get option(): ISchematicOptions {
        return this.#options;
    }

    /**
     * Used internally
     * @ignore
     */
    private _storeNetParams(name: string, code: number, ...nodes: Pin[]) {
        this.Nodes.push({ name, code, nodes, owner: null });
    }

    bom(output_folder?: string) {
        let bom: string = '';
        let _output_folder = output_folder || './build';

        // Create header from configured fields
        bom += this.#options.bom_fields.join(this.#options.bom_separator) + '\n';
        
        this.Components.forEach(component => {
            const fields = this.#options.bom_fields.map(field => {
                switch(field.toLowerCase()) {
                    case 'reference': return component.reference;
                    case 'value': return component.value;
                    case 'datasheet': return component.datasheet;
                    case 'footprint': return component.footprint;
                    case 'mpn': return component.mpn;
                    case 'description': return component.description;
                    case 'voltage': return component.voltage;
                    case 'wattage': return component.wattage;
                    default: return '';
                }
            });
            bom += fields.join(this.#options.bom_separator) + '\n';
        });

        try {
            fs.writeFileSync(`${_output_folder}/${this.Sheetname}.csv`, bom);
            process.stdout.write(chalk.cyan.bold(`${_output_folder}/${this.Sheetname}.csv`) + ` BOM written` + '\n');
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Initializes a new schematic with a given sheet name.
     *
     * @param {string} Sheetname - Name and filename of generated files.
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * ```
     */
    constructor(Sheetname: string) {
        this.Sheetname = Sheetname;
    }

    /**
     * Adds components to the schematic.
     *
     * @param {...Component[]} components - Components to add to the schematic.
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
     * Adds a no-connection flag to a pin.
     *
     * @param {...Pin[]} pins - Pins to mark as no-connect.
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
     * Sets a name for a net.
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
     * Connects a group of pins together.
     *
     * @param {...Pin[]} pins - Pins to connect.
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

        // make a net name using configured prefix
        let node_name = this._chained_name ? this._chained_name : `${this.#options.net_prefix}${this.code_counter}`;

        // check each pin in each node to see if a pin is connected somewhere else
        // if so, merge the nets by making their names the same
        pins.forEach((pin) => {
            if (!(pin instanceof Pin)) {
                this.error(`Invalid object passed to net(). Expected Pin, received ${typeof pin}`);
            }
            this.Nodes.forEach((netParam, index) => {
                netParam.nodes.forEach((netParamPin) => {
                    if (netParamPin.reference === pin.reference && netParamPin.number === pin.number) {
                        // notify about a merged named net if it isn't an auto-generated net and isn't the same net
                        if (!node_name.startsWith('net')) {
                            if (node_name != netParam.name) {
                                process.stdout.write(chalk.gray.bold(`${node_name}`) + ` net merged into ` + chalk.gray.bold(`${netParam.name}`) + '\n');
                            }
                        }
                        this.merged_nets.push({old_name: node_name, merged_to_number: this.Nodes[index].code});

                        node_name = netParam.name;
                    }
                });
            });
        });

        // store the node
        this._storeNetParams(node_name, this.code_counter, ...pins);

        // Check for duplicate node names and merge them
        let nodeMap: { [key: string]: { name: string, code: number, nodes: Pin[], owner: Component | null } } = {};
        this.Nodes.forEach((node) => {
            if (nodeMap[node.name]) {
                nodeMap[node.name].nodes.push(...node.nodes);
            } else {
                nodeMap[node.name] = { ...node, nodes: [...node.nodes] };
            }
        });

        // remove duplicate pins
        Object.values(nodeMap).forEach((node) => {
            node.nodes = node.nodes.filter((pin, index, self) =>
                index === self.findIndex((p) => (
                    p && pin && p.reference === pin.reference && p.number === pin.number
                ))
            );
        });

        this.Nodes = Object.values(nodeMap);

        // clear the name
        this._chained_name = '';
        // console.log(`  ➰  net ${node_name}`)

        let _net_display = '';
        pins.forEach((pin) => {
            _net_display += '~ ' + pin.reference + ':' + pin.number + ' ';
        });
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
     * Creates schematic files.
     *
     * @param {...Component[]} components - All the components to be included in the schematic.
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

            process.stdout.write(chalk.red.bold(`./build/${this.Sheetname}.net`) + ` file written` + '\n');
            process.stdout.write('🏁 ' + chalk.whiteBright.bold('type') + 'CAD finished' + '\n');

        } catch (err) {
            console.error(err);
            process.exit(1);
            return false;
        }
    }

    /**
     * Performs electrical rule checks.
     */
    erc() {
        erc(this);
    }

    /**
     * Logs an error message and exits.
     *
     * @param {string} error - The error message to log.
     */
    error(error: string) {
        process.stdout.write(chalk.bgRed(`👺 Error:`) +  chalk.bold(` ${error}` + '\n'));
        process.exit(1);
    }

    /**
     * Logs a warning message.
     *
     * @param {string} warning - The warning message to log.
     */
    warn(warning: string) {
        process.stdout.write(chalk.bgYellow(`WARN:`) +  chalk.bold(` ${warning}` + '\n'));
    }
}