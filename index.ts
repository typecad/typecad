#!/usr/bin/env tsx
export { Component } from './component'
export { Sheet } from './sheet'
export { Schematic } from './schematic'
export { Pin, IPin } from "./pin"
export { Bounds, Box } from './bounds'
export { UART, USB, GPIO, I2C } from './buses'
export { PCB } from './pcb'

import chalk from 'chalk';
import { KiCAD, kicad_cli_path, kicad_path } from './kicad'
import { exit } from 'node:process'

let kicad = new KiCAD();

console.log('🏁 ' + chalk.whiteBright.bold('type') + 'CAD starting...');


if (kicad_path && kicad_cli_path) {
} else {
    console.log('- ', chalk.red.bold('ERROR: KiCAD not found, go to https://github.com/typecad/typecad/wiki/typecad.json for more information'));
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
