import { expect, test } from 'vitest'
import { Schematic, Component, Sheet } from '../index'
import fs from "node:fs";

test('create a sheet', () => {
    let typecad = new Schematic('test');
    let sheet = new Sheet('sheet', typecad);
    let resistor = new Component('Device:R', 'R1');

    expect(sheet.create(resistor)).toBe(true)
    expect(fs.existsSync(`${process.cwd()}\\hw\\build\\sheet.kicad_sch`)).toBe(true);
    fs.unlinkSync(`${process.cwd()}\\hw\\build\\sheet.kicad_sch`);
});