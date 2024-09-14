import { expect, test } from 'vitest'
import { Schematic, Component, Sheet } from '../index'
import fs from "node:fs";

test('create a sheet', () => {
    let typecad = new Schematic('test');
    let sheet = new Sheet('sheet', typecad);
    let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});

    expect(sheet.create(resistor)).toBe(true)
    expect(fs.existsSync(`${process.cwd()}\\build\\sheet.kicad_sch`)).toBe(true);
    fs.unlinkSync(`${process.cwd()}\\build\\sheet.kicad_sch`);
});