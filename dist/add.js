#!/usr/bin/env tsx
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
- {in} lib:symbol
- {in} file to add imports to
- {out} file with: minimal ::Component
- {out} imported into main file
*/
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const kicad_symbol = "C:/Program Files/KiCad/8.0/share/kicad/symbols";
console.log(chalk_1.default.bgBlue.white("KiCode"), '+');
commander_1.program
    .option('-l, --library <string>')
    .option('-s, --symbol <string>');
commander_1.program.parse();
const options = commander_1.program.opts();
console.log(options.library);
console.log(options.symbol);
