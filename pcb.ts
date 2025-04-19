import { Component } from "./component";
import { Schematic } from "./schematic";
import fs from "node:fs";
import fsexp from "fast-sexpr";
import SExpr from "s-expression.js";
import chalk from 'chalk';
import { randomUUID } from "node:crypto";

const S = new SExpr()

/**
 * Interface representing a via on a PCB.
 *
 * @interface IVia
 * @property {Object} [at] - The position of the via.
 * @property {number} [at.x] - The x-coordinate of the via.
 * @property {number} [at.y] - The y-coordinate of the via.
 * @property {number} [size] - The size of the via.
 * @property {number} [drill] - The drill size of the via.
 * @property {string} [net] - The net associated with the via.
 * @property {string} [uuid] - The unique identifier for the via.
 * @ignore
 */
export interface IVia {
    at?: { x: number, y: number },
    size?: number,
    drill?: number,
    net?: string,
    uuid?: string,
}

/**
 * Class representing a printed circuit board (PCB).
 *
 * @class PCB
 */
export class PCB {
    Boardname: string;
    // #Schematic: Schematic;
    #pcb: string = '';
    #footprints: string[] = [];
    #components: Component[] = [];
    #groups: string[] = [];
    #vias: string[] = [];
    #group_uuid = '';

    /**
     * Initializes a new PCB with a given board name.
     *
     * @param {string} Boardname - Name and filename of generated files.
     * @example
     * ```ts
     * let board = new PCB('boardname');
     * ```
     */
    constructor(Boardname: string) {
        this.Boardname = Boardname;
        // this.#Schematic = schematic;
    }

    /**
     * Places components on the board.
     *
     * @param {Component[]} components - List of components to place on the board.
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({});
     * 
     * r1.pcb = {x: 10, y: 10, rotation: 90};
     * board.place(r1);
     * ```
     */
    place(...components: Component[]) {
        components.forEach((component) => {
            if (component.dnp === true) {
                return;
            }
            if (component.via == false) {
                this.#footprints.push(component.footprint_lib(component.footprint!));
                this.#components.push(component);
            } else {
                this.#components.push(component);
            }
        });
    }

    /**
     * Groups components together on the board.
     *
     * @param {string} group_name - Name of the group.
     * @param {Component[]} components - List of components to place on the board.
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({});
     * 
     * r1.pcb = {x: 10, y: 10, rotation: 90};
     * board.group('resistor', r1);
     * ```
     */
    group(group_name: string, ...component: Component[]) {
        let uuid_list = '';
        component.forEach((_component) => {
            if (_component.dnp === true) {
                return;
            }
            if (_component.via == false) {
                this.#footprints.push(_component.footprint_lib(_component.footprint!));
                this.#components.push(_component);
                uuid_list += `"${_component.uuid}" `;
            } else {
                uuid_list += `"${_component.uuid}" `;
            }
        });

        this.#groups.push(`(group "${group_name}" (members ${uuid_list}))`)
        process.stdout.write(chalk.yellow.bold(`${group_name}`) + ` group added` + '\n');

    }

    /**
     * Creates and saves the board to a file.
     *
     * @example
     * ```ts
     * board.create();
     * ```
     */
    create() {
        let version = '(version 20240108)';
        let generator = '(generator "typecad")';
        let generator_version = '(generator_version "1.0")';
        let general = '(general (thickness 1.6) (legacy_teardrops no))';
        let paper = '(paper "A4")';
        let s_board_contents: any[] = [];

        // if board exists, keep everything except the footprints, groups, vias and nets
        if (fs.existsSync(`./build/${this.Boardname}.kicad_pcb`)) {
            let board_contents = fs.readFileSync(
                `./build/${this.Boardname}.kicad_pcb`,
                "utf8"
            );

            board_contents = board_contents.replaceAll('"', "`");
            s_board_contents = fsexp(board_contents).pop();

            // Process footprints
            for (var i in s_board_contents) {
                if (s_board_contents[i][0] == 'footprint') {
                    delete s_board_contents[i];
                }
            }
            for (var i in s_board_contents) {
                if (s_board_contents[i][0] == 'group') {
                    delete s_board_contents[i];
                }
            }

            // for (var i in s_board_contents) {
            //     if (s_board_contents[i][0] == 'via') {
            //         delete s_board_contents[i];
            //     }
            // }
            // for (var i in s_board_contents) {
            //     if (s_board_contents[i][0] == 'net') {
            //         delete s_board_contents[i];
            //     }
            // }
        }

        // if the board didn't exist or had something wrong with it
        if (s_board_contents == undefined || s_board_contents.length == 0) {
            // if the board file didn't exist, make a blank
            let board_contents = `(kicad_pcb ${version} ${generator} ${generator_version} ${general} ${paper})`;

            board_contents = board_contents.replaceAll('"', "`");
            s_board_contents = fsexp(board_contents).pop();
        }

        // add footprints
        for (let i = 0; i < this.#footprints.length; i++) {
            let footprint_contents = this.#footprints[i].replaceAll('"', "`");
            const l = fsexp(footprint_contents).pop();

            if (l == undefined){
                process.stdout.write(chalk.bgRed(`ERR:`) +  chalk.bold(` [${this.#components[i].footprint} ${this.#components[i].reference} ${this.#components[i].description}] .kicad_mod is missing or empty, does it exist in build/footprints/?` + '\n'));
                process.exit(1);
            }

            // typeCAD will always insert the rotation, even if it is 0
            if (this.#components[i].pcb.rotation == undefined) {
                this.#components[i].pcb.rotation = 0;
            }

            l.splice(2, 0, [`at ${this.#components[i].pcb.x} ${this.#components[i].pcb.y} ${this.#components[i].pcb.rotation}`]);

            // add uuid field to each component, then add to group
            l.splice(2, 0, [`uuid "${this.#components[i].uuid}"`]);
            this.#group_uuid += `"${this.#components[i].uuid}" `;

            // correct footprint name
            l[1] = `"${this.#components[i].footprint}"`;

            // loop through and replace references, values 
            for (var ii in l) {
                if (l[ii][0] == 'property') {
                    if (l[ii][1] == '`Reference`') {
                        if (this.#components[i].reference != undefined) {
                            l[ii][2] = `"${this.#components[i].reference}"`;
                        }
                    }

                    if (l[ii][1] == '`Value`') {
                        if (this.#components[i].value != undefined) {
                            l[ii][2] = `"${this.#components[i].value}"`;
                        }
                    }

                    if (l[ii][1] == '`Footprint`') {
                        if (this.#components[i].footprint != undefined) {
                            l[ii][2] = `"${this.#components[i].footprint}"`;
                        }
                    }

                    if (l[ii][1] == '`Datasheet`') {
                        if (this.#components[i].datasheet != undefined) {
                            l[ii][2] = `"${this.#components[i].datasheet}"`;
                        }
                    }

                    if (l[ii][1] == '`Description`') {
                        if (this.#components[i].description != undefined) {
                            l[ii][2] = `"${this.#components[i].description}"`;
                        }
                    }

                    if (l[ii][1] == '`MPN`') {
                        if (this.#components[i].mpn != undefined) {
                            l[ii][2] = `"${this.#components[i].mpn}"`;
                        }
                    }
                }

                // all pads need to be rotated to match the main body
                if (l[ii][0] == 'pad') {
                    for (var iii in l[ii]) {
                        if (l[ii][iii][0] == 'at') {
                            // check if there is already a rotation property or not, add/replace it with slice
                            if (l[ii][iii].length == 3) {
                                l[ii][iii].splice(3, 0, `${this.#components[i].pcb.rotation}`);
                            } else if (l[ii][iii].length == 4) {
                                l[ii][iii].splice(3, 1, `${(this.#components[i].pcb.rotation! - l[ii][iii][3])}`);
                            }
                        }
                    }
                }

                // some footprints have the reference in fp_text
                if (l[ii][0] == 'fp_text') {
                    if (String(l[ii][1]).toLowerCase() == 'reference') {
                        if (this.#components[i].reference != undefined) {
                            l[ii][2] = `"${this.#components[i].reference}"`;
                        }
                    }
                }
            }

            // insert footprints after required header information
            s_board_contents.splice(6, 0, l);
            footprint_contents = S.serialize(s_board_contents, { includingRootParentheses: true });
            footprint_contents = footprint_contents.replaceAll("`", '"');
            this.#pcb = footprint_contents;
        }

        // if no footprints
        if (!this.#pcb) {
            this.#pcb = S.serialize(s_board_contents, { includingRootParentheses: true });
            this.#pcb = this.#pcb.replaceAll("`", '"');
        }

        // add nets
        // let net_text = '(net 0 "")';
        // this.#Schematic.Nodes.forEach((node) => {
        //     net_text += (`(net ${node.code} "${node.name}")`);
        // });

        // group components
        let group_text = '';
        this.#groups.forEach((group) => {
            group_text += group;
        });
        this.#pcb = this.#pcb.slice(0, (this.#pcb.length - 1)) + group_text + ')';

        // add vias
        let via_text = '';
        this.#vias.forEach((via) => {
            via_text += via;
        });

        // this.#pcb = this.#pcb.slice(0, (this.#pcb.length - 1)) + net_text + via_text + ')';

        try {
            fs.writeFileSync(`./build/${this.Boardname}.kicad_pcb`, this.#pcb);
            process.stdout.write(chalk.green.bold(`./build/${this.Boardname}.kicad_pcb`) + ` written` + '\n');

        } catch (err) {
            console.error(err);
        }
    }

    // most via-related code has been commented out
    /**
     * Handles via-related operations.
     *
     * @param {IVia} [via] - The via details.
     * @returns {Component} - The component representing the via.
     * @ignore
     */
    via({ at, size, drill, net, uuid }: IVia = {}): Component {
        // if (!at) at = { x: 0, y: 0 };
        // if (!size) size = 0.6;
        // if (!drill) drill = 0.3;
        // if (!net) net = "";
        // if (!uuid) uuid = randomUUID();

        // let netCode;
        // this.#Schematic.Nodes.forEach((node) => {
        //     if (node.name === net) {
        //         netCode = node.code;
        //     } else {
        //         // netCode = 0;
        //         this.#Schematic.merged_nets.forEach((merged_net) => {
        //             // console.log(net, merged_net.old_name)
        //             if (net == merged_net.old_name) {
        //                 netCode = merged_net.merged_to_number;
        //             }
        //         });
        //     }
        // });
        // this.#vias.push(`(via (at ${at.x} ${at.y}) (size ${size}) (drill ${drill}) (layers "F.Cu" "B.Cu") (free yes) (net ${netCode}) (uuid "${uuid}") )`);
        // return new Component({uuid: uuid, via: true});
        return new Component();
    }
}