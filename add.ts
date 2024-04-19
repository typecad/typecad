#!/usr/bin/env tsx
/*
- {in} lib:symbol
- {in} file to add imports to
- {out} file with: minimal ::Component
- {out} imported into main file
*/
import { program } from 'commander';
import chalk from 'chalk';

const kicad_symbol = "C:/Program Files/KiCad/8.0/share/kicad/symbols";

console.log(chalk.bgBlue.white("KiCode"), '+');
program
  .option('-l, --library <string>')
  .option('-s, --symbol <string>');

program.parse();

const options = program.opts();
console.log(options.library);
console.log(options.symbol);
