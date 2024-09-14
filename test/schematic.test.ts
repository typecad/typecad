import { expect, test } from 'vitest'
import { Schematic, Component } from '../index'
import fs from "node:fs";

test('connect named net to pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
    expect(typecad.net({ net: 'test', pins: [resistor.pin(1), resistor.pin(2)] })).toBe(true)
});

test('connect unnamed net to pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
    expect(typecad.net({ pins: [resistor.pin(1), resistor.pin(2)] })).toBe(true)
});

test('connect net to missing pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
    expect(typecad.net({ net: 'test', pins: [resistor.pin(3)] })).toBe(false)
});

test('connect dnc to pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
    expect(typecad.dnc(resistor.pin(1))).toBe(true)
});

test('connect dnc to missing pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
    expect(typecad.dnc(resistor.pin(3))).toBe(false)
});

test('create a schematic', () => {
    let typecad = new Schematic('test');
    let resistor = new Component({symbol: "Device:R_Small", reference: 'R1', value: '1 kOhm', footprint: "Resistor_SMD:R_0603_1608Metric"});
    expect(typecad.create(resistor)).toBe(true)
    expect(fs.existsSync(`${process.cwd()}\\./build/test.kicad_sch`)).toBe(true);
    fs.unlinkSync(`${process.cwd()}\\./build/test.kicad_sch`);
});