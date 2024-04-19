#!/usr/bin/env tsx
export { Component } from './component'
export { Sheet } from './sheet'
export { Schematic } from './schematic'
export { Pin, IPin } from "./pin"
export { Bounds } from './bounds'
import { KiCAD, kicad_cli_path, kicad_path } from './kicad'
import { exit } from 'node:process'

let kicad = new KiCAD();

if (kicad_path && kicad_cli_path) {
} else {
    console.log("kicad not found")
    exit();
}

/**
 * Used internally
 * @ignore
 */
export class KiCodeTextBox {
    name = "text_box";
    x = 0;
    y = 0;
    height = 30;
    width = 70;
    border_width = 0.5;
    border_color = { r: 72, g: 72, b: 72, a: 1 };
    background = { r: 0, g: 0, b: 0, a: 0 };
    font = {
        size: 1.27,
        bold: "no",
        italic: "no",
        color: { r: 72, g: 72, b: 72, a: 1 },
    };
    justify = "top left";
}

// /** Devices */
// export enum Devices {
//     /** small capacitor: p1, p2 */
//     C_Small = 'Device:C_Small',
//     /** small diode: pin 1 anode, pin 2 cathode */
//     D_Small = 'Device:D_Small',
//     /** small resistor: p1, p2 */
//     R_Small = 'Device:R_Small',
// }