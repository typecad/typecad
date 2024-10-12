import { Component } from "./component";
import fs from "node:fs";
import fsexp from "fast-sexpr";
import SExpr from "s-expression.js";
import { Console } from "node:console";

const S = new SExpr()

export class PCB {
    #Boardname: string;
    #pcb: string = '';
    #footprints: string[] = [];
    #components: Component[] = [];

    constructor(Boardname: string) {
        this.#Boardname = Boardname;

    }

    place(...components: Component[]) {
        components.forEach((component) => {
            this.#footprints.push(component.footprint_lib(component.Footprint!));
            this.#components.push(component);
        });
    }

    create() {
        let version = '(version 20240108)';
        let generator = '(generator "typecad")';
        let generator_version = '(generator_version "1.0")';
        let general = '(general (thickness 1.6) (legacy_teardrops no))';
        let paper = '(paper "A4")';
        let layers = '';
        let setup = '';
        let s_board_contents = [];

        if (fs.existsSync(`./build/${this.#Boardname}.kicad_pcb`)) {
            console.log('\nboard file exists');

            let board_contents = fs.readFileSync(
                `./build/${this.#Boardname}.kicad_pcb`,
                "utf8"
            );

            board_contents = board_contents.replaceAll('"', "`");
            s_board_contents = fsexp(board_contents).pop();

            // delete previous footprints
            for (var i in s_board_contents) {
                if (s_board_contents[i][0] == 'footprint') {
                    delete s_board_contents[i];
                }
            }
        }

        // add footprints
        for (let i = 0; i < this.#footprints.length; i++) {
            // REF** can be anywhere
            let footprint_contents = this.#footprints[i].replaceAll('"', "`").replaceAll('REF**', "`" + this.#components[i].Reference + "`" || '');
            const l = fsexp(footprint_contents).pop();
            l.splice(2, 0, [`at ${this.#components[i].pcb.x} ${this.#components[i].pcb.y} ${this.#components[i].pcb.rotation}`]);

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
                        // console.log(l[ii][iii][0])
                        if (l[ii][iii][0] == 'at') {
                            l[ii][iii].splice(3, 0, `${this.#components[i].pcb.rotation}`);
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

        try {
            fs.writeFileSync(`./build/${this.#Boardname}.kicad_pcb`, this.#pcb);
        } catch (err) {
            console.error(err);
        }
    }


}