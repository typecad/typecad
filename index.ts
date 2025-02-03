#!/usr/bin/env tsx
export { Component, IComponent } from './component'
export { Schematic } from './schematic'
export { Pin } from './pin'
export { I2C, PowerInput, PowerSupply, UART, USB, Power } from './buses'
export { PCB } from './pcb'
export { KiCAD, kicad_cli_path, kicad_path } from './kicad'

import chalk from 'chalk';
import { KiCAD, kicad_cli_path, kicad_path } from './kicad'
import { exit } from 'node:process'

// get KiCAD's installation path
new KiCAD();

console.log('🏁 ' + chalk.whiteBright.bold('type') + 'CAD starting...');


if (kicad_path && kicad_cli_path) {
} else {
    console.log('- ', chalk.red.bold('ERROR: KiCAD not found, go to https://github.com/typecad/typecad/wiki/typecad.json for more information'));
    exit();
}
