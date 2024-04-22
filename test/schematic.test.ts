import { expect, test } from 'vitest'
import { Schematic, Component } from '../index'
import fs from "node:fs";

test('connect net to pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component('Device:R', 'R1');
    expect(typecad.net('test', resistor.pin(1))).toBe(true)
});

test('connect net to missing pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component('Device:R', 'R1');
    expect(typecad.net('test', resistor.pin(3))).toBe(false)
});

test('connect dnc to pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component('Device:R', 'R1');
    expect(typecad.dnc(resistor.pin(1))).toBe(true)
});

test('connect dnc to missing pin', () => {
    let typecad = new Schematic('test');
    let resistor = new Component('Device:R', 'R1');
    expect(typecad.dnc(resistor.pin(3))).toBe(false)
});

test('create a schematic', () => {
    let typecad = new Schematic('test');
    let resistor = new Component('Device:R', 'R1');
    expect(typecad.create(resistor)).toBe(true)
    expect(fs.existsSync(`${process.cwd()}\\test.kicad_sch`)).toBe(true);
    fs.unlinkSync(`${process.cwd()}\\test.kicad_sch`);
});