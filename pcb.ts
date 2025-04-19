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

        // Check if a group with this name already exists
        const existingGroupIndex = this.#groups.findIndex(group => 
            group.startsWith(`(group "${group_name}"`)
        );

        const newGroupString = `(group "${group_name}" (members ${uuid_list}))`;

        if (existingGroupIndex !== -1) {
            // Update existing group
            console.log(`Updating existing group at index ${existingGroupIndex}`);
            this.#groups[existingGroupIndex] = newGroupString;
            process.stdout.write(chalk.yellow.bold(`${group_name}`) + ` group updated` + '\n');
        } else {
            // Add new group
            this.#groups.push(newGroupString);
            process.stdout.write(chalk.yellow.bold(`${group_name}`) + ` group added` + '\n');
        }

    }

    /**
     * Updates an existing footprint S-expression node with data from a component.
     * @param node The existing footprint S-expression node array.
     * @param component The component data to update with.
     * @returns The updated S-expression node array.
     * @private
     */
    #_update_footprint_node(node: any[], component: Component): any[] {
        // Ensure rotation is defined (still needed for potential property updates, though not for 'at')
        // if (component.pcb.rotation === undefined) {
        //     component.pcb.rotation = 0;
        // }

        // Ensure UUID exists and is correct (it should exist if we matched by it)
        let uuidNodeFound = false;
        for (let i = 0; i < node.length; i++) {
            if (Array.isArray(node[i]) && node[i][0] === 'uuid') {
                 node[i] = ['uuid', `\`${component.uuid}\``]; // Update just in case, though should match
                 uuidNodeFound = true;
                 break;
             }
        }
         if (!uuidNodeFound) {
             node.splice(2, 0, [`uuid \`${component.uuid}\``]); // Add if missing
         }

        // Update footprint name (usually shouldn't change if UUID matches, but safe)
        node[1] = `\`${component.footprint}\``;

        // Loop through and update properties and pads
        for (let i = 0; i < node.length; i++) {
            const subItem = node[i];
            if (!Array.isArray(subItem)) continue;

            const itemType = subItem[0];

            if (itemType === 'property') {
                const propName = subItem[1];
                if (propName === '`Reference`' && component.reference !== undefined) {
                    subItem[2] = `\`${component.reference}\``;
                } else if (propName === '`Value`' && component.value !== undefined) {
                    subItem[2] = `\`${component.value}\``;
                } else if (propName === '`Footprint`' && component.footprint !== undefined) {
                    subItem[2] = `\`${component.footprint}\``;
                } else if (propName === '`Datasheet`' && component.datasheet !== undefined) {
                    subItem[2] = `\`${component.datasheet}\``;
                } else if (propName === '`Description`' && component.description !== undefined) {
                    subItem[2] = `\`${component.description}\``;
                } else if (propName === '`MPN`' && component.mpn !== undefined) {
                    subItem[2] = `\`${component.mpn}\``;
                }
            } else if (itemType === 'fp_text') {
                 if (String(subItem[1]).toLowerCase() === 'reference' && component.reference !== undefined) {
                    subItem[2] = `\`${component.reference}\``;
                }
                // Potentially update other fp_text types if needed
            }
        }
        return node;
    }


     /**
      * Creates a new footprint S-expression node from a component.
      * Reads the .kicad_mod file, parses it, and inserts component data.
      * @param component The component to create the node for.
      * @returns The new S-expression node array.
      * @throws Error if the .kicad_mod file is missing, empty, or parsing fails.
      * @private
      */
     #_create_footprint_node(component: Component): any[] {
        const footprint_contents = component.footprint_lib(component.footprint!).replaceAll('"', "`");
        let l: any[];
        try {
            l = fsexp(footprint_contents).pop();
             if (l === undefined || !Array.isArray(l)) {
                 throw new Error("Parsed footprint is undefined or not an array");
             }
        } catch (e: any) {
            throw new Error(`Failed to parse ${component.footprint}: ${e.message}`);
        }


         // TypeCAD will always insert the rotation, even if it is 0
         if (component.pcb.rotation === undefined) {
             component.pcb.rotation = 0;
         }

         l.splice(2, 0, [`at ${component.pcb.x} ${component.pcb.y} ${component.pcb.rotation}`]);

         // Add uuid field to each component
         l.splice(2, 0, [`uuid \`${component.uuid}\``]); // Use backticks for SExpr parser

         // Correct footprint name (use component's, not the one from the lib file)
         l[1] = `\`${component.footprint}\``;

         // Loop through and replace references, values
            for (var ii in l) {
             if (Array.isArray(l[ii]) && l[ii][0] == 'property') {
                    if (l[ii][1] == '`Reference`') {
                     if (component.reference != undefined) {
                         l[ii][2] = `\`${component.reference}\``;
                        }
                    }

                    if (l[ii][1] == '`Value`') {
                     if (component.value != undefined) {
                         l[ii][2] = `\`${component.value}\``;
                        }
                    }

                    if (l[ii][1] == '`Footprint`') {
                     if (component.footprint != undefined) {
                         l[ii][2] = `\`${component.footprint}\``;
                        }
                    }

                    if (l[ii][1] == '`Datasheet`') {
                     if (component.datasheet != undefined) {
                         l[ii][2] = `\`${component.datasheet}\``;
                        }
                    }

                    if (l[ii][1] == '`Description`') {
                     if (component.description != undefined) {
                         l[ii][2] = `\`${component.description}\``;
                        }
                    }

                    if (l[ii][1] == '`MPN`') {
                     if (component.mpn != undefined) {
                         l[ii][2] = `\`${component.mpn}\``;
                        }
                    }
                }

             // All pads need their rotation adjusted relative to the component rotation
             if (Array.isArray(l[ii]) && l[ii][0] == 'pad') {
                    for (var iii in l[ii]) {
                     if (Array.isArray(l[ii][iii]) && l[ii][iii][0] == 'at') {
                         const atArray = l[ii][iii];
                         // Check if there is already a rotation property or not, add/replace it
                         let padBaseRotation = 0;
                          if (atArray.length === 4) {
                             padBaseRotation = parseFloat(atArray[3]) || 0; // Rotation from footprint file
                             atArray.splice(3, 1, `${(component.pcb.rotation! + padBaseRotation)}`); // Add component rotation to pad rotation
                         } else if (atArray.length === 3) {
                              atArray.splice(3, 0, `${component.pcb.rotation}`); // Add component rotation if none existed
                         }
                     }
                 }
             }

             // Some footprints have the reference in fp_text
             if (Array.isArray(l[ii]) && l[ii][0] == 'fp_text') {
                    if (String(l[ii][1]).toLowerCase() == 'reference') {
                     if (component.reference != undefined) {
                         l[ii][2] = `\`${component.reference}\``;
                     }
                 }
             }
         }
        return l;
     }

    /**
     * Creates and saves the board to a file.
     *
     * @param {...Component[]} components - Components to add to the board before creating.
     * @example
     * ```ts
     * let board = new PCB('boardname');
     * let r1 = new Component({});
     * let r2 = new Component({});
     * board.create(r1, r2);
     * ```
     */
    create(...components: Component[]) {
        // Add any components passed to create()
        components.forEach((component) => {
            this.place(component);
        });

        const version = '(version 20240108)'; // TODO: Consider updating version dynamically or making it configurable
        const generator = '(generator "typecad")';
        const generator_version = '(generator_version "1.0")'; // TODO: Update version
        const general = '(general (thickness 1.6) (legacy_teardrops no))';
        const paper = '(paper "A4")';

        // Create a map of components keyed by UUID for efficient lookup
        const componentMap = new Map<string, Component>();
        this.#components.forEach(comp => {
            // Only consider placeable components (not DNP) that have a UUID and are not vias (vias handled separately)
             if (!comp.dnp && comp.uuid && comp.via === false) {
                componentMap.set(comp.uuid, comp);
            }
        });

        let existing_board_contents: any[] = [];
        const boardFilePath = `./build/${this.Boardname}.kicad_pcb`;

        // If board exists, read and parse it
        if (fs.existsSync(boardFilePath)) {
            try {
                let board_contents_str = fs.readFileSync(boardFilePath, "utf8");
                // Replace quotes for SExpr parser compatibility
                board_contents_str = board_contents_str.replaceAll('"', "`");
                // Parse the S-expression. Assumes the root is (kicad_pcb ...)
                 const parsed = fsexp(board_contents_str);
                 if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0]) && parsed[0][0] === 'kicad_pcb') {
                     existing_board_contents = parsed[0]; // Get content inside (kicad_pcb ...)
                 } else {
                     console.warn(chalk.yellow(`WARN: Could not parse existing board file structure: ${boardFilePath}. Starting new.`));
                    existing_board_contents = [];
                 }
            } catch (e: any) {
                console.error(chalk.red(`👺 Error: Failed to read or parse existing board file ${boardFilePath}: ${e.message}. Starting new.`));
                existing_board_contents = []; // Start fresh if parsing fails
            }
        }

        // Prepare the final board structure
        let final_board_contents: any[] = [];
        let headerItems = [version, generator, generator_version, general, paper];

        // If existing board had content, try to preserve header and setup, otherwise use defaults
        if (existing_board_contents.length > 1) { // existing_board_contents[0] is 'kicad_pcb'
             // Copy existing non-footprint, non-group items first
             existing_board_contents.slice(1).forEach(item => { // Skip 'kicad_pcb' symbol
                 if (typeof item === 'string' && item.startsWith('(')) { // Keep raw string elements like version, generator etc.
                     final_board_contents.push(item);
                 } else if (Array.isArray(item)) {
                     const nodeType = item[0];
                     // Only keep non-footprint and non-group items
                     if (nodeType !== 'footprint' && nodeType !== 'group') {
                         final_board_contents.push(item);
                     }
                 }
             });
             // Ensure essential headers are present if they were missing
             headerItems.forEach(header => {
                 const headerSymbol = header.substring(1, header.indexOf(" "));
                 if (!final_board_contents.some(item => (typeof item === 'string' && item.includes(`(${headerSymbol}`)) || (Array.isArray(item) && item[0] === headerSymbol))) {
                     final_board_contents.unshift(header); // Add missing headers at the beginning
                 }
             });
        } else {
            // No existing content or parsing failed, use default headers
            final_board_contents = [...headerItems];
        }

        // Add groups (rebuilds groups based on current definitions)
         this.#groups.forEach((groupString) => {
             try {
                 // Groups are stored as raw strings, parse them before adding
                 const groupNode = fsexp(groupString.replaceAll('"', "`")).pop();
                 if(groupNode) {
                     final_board_contents.push(groupNode);
                 }
             } catch(e: any) {
                  console.error(chalk.red(`👺 Error: Failed to parse group string: ${groupString} - ${e.message}`));
             }
         });

         // Clear groups after they've been added to the board
         this.#groups = [];

        // Process existing footprints: update or discard
        if (existing_board_contents.length > 1) {
            existing_board_contents.slice(1).forEach(item => {
                if (Array.isArray(item) && item[0] === 'footprint') {
                    let uuid: string | null = null;
                    // Find UUID within the footprint node
                     for (const subItem of item) {
                         if (Array.isArray(subItem) && subItem[0] === 'uuid' && typeof subItem[1] === 'string') {
                             uuid = subItem[1].replaceAll('`', ''); // Remove backticks
                             break;
                         }
                     }

                    if (uuid && componentMap.has(uuid)) {
                        // Found matching component: update the node
                        const component = componentMap.get(uuid)!;
                        try {
                            const updatedNode = this.#_update_footprint_node(item, component);
                            final_board_contents.push(updatedNode);
                            componentMap.delete(uuid); // Mark component as processed
                        } catch (e: any) {
                            console.error(chalk.red(`👺 Error: Failed to update footprint node for ${component.reference}: ${e.message}`));
                        }
                    } else {
                        // No matching component found for this existing footprint
                        // This footprint should be removed as it's no longer in the schematic
                    }
                }
            });
        }

        // Add new footprints for components not found in the existing file
        componentMap.forEach(component => {
            try {
                const newNode = this.#_create_footprint_node(component);
                final_board_contents.push(newNode);
            } catch (e: any) {
                 process.stdout.write(chalk.bgRed(`👺 Error:`) + chalk.bold(` [${component.footprint} ${component.reference} ${component.description}] Failed to create footprint node. Is .kicad_mod missing or empty in build/footprints/?`) + '\n');
                 process.stdout.write(chalk.red(` -> ${e.message}`) + '\n');
                process.exit(1); // Original behavior
            }
        });

        // Serialize the final board structure
        // Wrap final_board_contents inside the root (kicad_pcb ...)
        const finalStructure = ['kicad_pcb', ...final_board_contents];
        try {
             this.#pcb = S.serialize(finalStructure, { includingRootParentheses: true });
             // Replace backticks back with quotes for the final file
             this.#pcb = this.#pcb.replaceAll("`", '"');
        } catch (e: any) {
             console.error(chalk.red(` 👺 Error: Failed to serialize final board structure: ${e.message}`));
             this.#pcb = ""; // Prevent writing corrupted data
             return; // Stop before writing
        }

        // Write the final PCB file
        try {
            // Check for lock file
            const pcbDir = boardFilePath.substring(0, boardFilePath.lastIndexOf('/'));
            const pcbFileName = boardFilePath.split('/').pop() || boardFilePath;
            const lockFilePath = `${pcbDir}/~${pcbFileName}.lck`;
            if (fs.existsSync(lockFilePath)) {
                process.stdout.write(chalk.bgRed(`👺 Error:`) +  chalk.bold(` ${boardFilePath} is open in KiCAD (${pcbDir}/~${pcbFileName}.lck exists)` + '\n'));
                return;
            }

            fs.writeFileSync(boardFilePath, this.#pcb);
            process.stdout.write(chalk.green.bold(boardFilePath) + ` written` + '\n');
        } catch (err) {
            console.error(chalk.red(`👺 Error: Could not write board file ${boardFilePath}: ${err}`));
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