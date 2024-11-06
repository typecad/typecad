import { Component } from "./component";
import fs from "node:fs";
import fsexp from "fast-sexpr";
import SExpr from "s-expression.js";
import chalk from 'chalk';

const S = new SExpr()

export class PCB {
    #Boardname: string;
    #pcb: string = '';
    #footprints: string[] = [];
    #components: Component[] = [];
    #groups: string[] = [];
    #group_uuid = '';

    /**
     * `constructor` for PCB
     *
     * @constructor
     * @param {string} Boardname Name and filename of generated files
     * @example
     * ```ts
     * let board = new PCB('boardname');
     * ```
     */
    constructor(Boardname: string) {
        this.#Boardname = Boardname;
    }

    /**
     * `place` function to place components on the board
     *
     * @param {Component[]} components List of components to place on the board
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
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
            this.#footprints.push(component.footprint_lib(component.Footprint!));
            this.#components.push(component);
        });
    }

    /**
     * `group` function to place components on the board and group them together
     *
     * @param {string} group_name Name of the group
     * @param {Component[]} components List of components to place on the board
     * @example
     * ```ts
     * let typecad = new Schematic('sheetname');
     * let r1 = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
     * 
     * r1.pcb = {x: 10, y: 10, rotation: 90};
     * board.group('resistor', r1);
     * ```
     */
    group(group_name: string,  ...components: Component[]) {
        let uuid_list = '';
        components.forEach((component) => {
            if (component.dnp === true) {
                return;
            }
            this.#footprints.push(component.footprint_lib(component.Footprint!));
            this.#components.push(component);
            uuid_list += `"${component.uuid}" `;
        });

        this.#groups.push(`(group "${group_name}" (members ${uuid_list}))`)
        //console.log(this.#groups);
    }

    /**
     * `create` function to create and save the board
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
        let s_board_contents = [];

        // if board exists, keep everything except the footprints
        if (fs.existsSync(`./build/${this.#Boardname}.kicad_pcb`)) {
            let board_contents = fs.readFileSync(
                `./build/${this.#Boardname}.kicad_pcb`,
                "utf8"
            );

            board_contents = board_contents.replaceAll('"', "`");
            s_board_contents = fsexp(board_contents).pop();

            // delete previous footprints and groups
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
        } 
        
        // if the board didn't exist or had something wrong with it
        if (s_board_contents == undefined){
            // if the board file didn't exist, make a blank
            let board_contents = `(kicad_pcb ${version} ${generator} ${generator_version} ${general} ${paper})`;

            board_contents = board_contents.replaceAll('"', "`");
            s_board_contents = fsexp(board_contents).pop();
        }

        // add footprints
        for (let i = 0; i < this.#footprints.length; i++) {
            let footprint_contents = this.#footprints[i].replaceAll('"', "`");//.replaceAll('REF**', "`" + this.#components[i].Reference + "`" || '');
            const l = fsexp(footprint_contents).pop();

            // typeCAD will always insert the rotation, even if it is 0
            if (this.#components[i].pcb.rotation == undefined) {
                this.#components[i].pcb.rotation = 0;
            }

            l.splice(2, 0, [`at ${this.#components[i].pcb.x} ${this.#components[i].pcb.y} ${this.#components[i].pcb.rotation}`]);

            // add uuid field to each component, then add to group
            l.splice(2, 0, [`uuid "${this.#components[i].uuid}"`]);
            this.#group_uuid += `"${this.#components[i].uuid}" `;

            // correct footprint name
            l[1] = `"${this.#components[i].Footprint}"`;

            // loop through and replace references, values 
            for (var ii in l) {
                if (l[ii][0] == 'property') {
                    if (l[ii][1] == '`Reference`') {
                        if (this.#components[i].Reference != undefined) {
                            l[ii][2] = `"${this.#components[i].Reference}"`;
                        }
                    }

                    if (l[ii][1] == '`Value`') {
                        if (this.#components[i].Value != undefined) {
                            l[ii][2] = `"${this.#components[i].Value}"`;
                        }
                    }

                    if (l[ii][1] == '`Footprint`') {
                        if (this.#components[i].Footprint != undefined) {
                            l[ii][2] = `"${this.#components[i].Footprint}"`;
                        }
                    }

                    if (l[ii][1] == '`Datasheet`') {
                        if (this.#components[i].Datasheet != undefined) {
                            l[ii][2] = `"${this.#components[i].Datasheet}"`;
                        }
                    }

                    if (l[ii][1] == '`Description`') {
                        if (this.#components[i].Description != undefined) {
                            l[ii][2] = `"${this.#components[i].Description}"`;
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
                        if (this.#components[i].Reference != undefined) {
                            l[ii][2] = `"${this.#components[i].Reference}"`;
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

        // group components
        // let group = `(group "${this.#Boardname}" (members ${this.#group_uuid})`
        let group_text = '';
        this.#groups.forEach((group) => {
            group_text += group;
        });

        this.#pcb = this.#pcb.slice(0, (this.#pcb.length - 1)) + group_text + ')';
        try {
            fs.writeFileSync(`./build/${this.#Boardname}.kicad_pcb`, this.#pcb);
            process.stdout.write(chalk.white("\n+"));
            process.stdout.write(chalk.bgGreen("board"));
        } catch (err) {
            console.error(err);
        }
    }


}