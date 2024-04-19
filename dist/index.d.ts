#!/usr/bin/env tsx
export declare class Component {
    Footprint: string;
    symbol: string;
    coord: {
        x: number;
        y: number;
    };
    Reference: string;
    Value: string;
    Datasheet: string;
    /**
     * Creates a Component.
     *
     * @constructor
     * @param {string} symbol
     * @param {string} reference
     * @param {?string} [value]
     * @param {?string} [footprint]
     * @param {?Bounds} [nn]
     */
    constructor(symbol: string, reference: string, value?: string, footprint?: string, nn?: Bounds);
    pin(number: number): Pin;
    update(): string;
    symbol_lib(symbol: string): string;
    xy(x: number, y: number): void;
}
export declare class KiCodeTextBox {
    name: string;
    x: number;
    y: number;
    height: number;
    width: number;
    border_width: number;
    border_color: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    background: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    font: {
        size: number;
        bold: string;
        italic: string;
        color: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    };
    justify: string;
}
type HierPinType = "passive" | "input" | "output" | "bidirectional" | "tri_state";
export type HierPin = {
    name: string;
    type: HierPinType;
    x: any;
    y: any;
    a: number;
};
export type NetList = {
    name: string;
    pins: Pin;
};
export declare class Schematic {
    Sheetname: string;
    private schematic;
    private symbols;
    private symbol_libs;
    private nets;
    private sheets;
    private boxes;
    private net_list;
    constructor(Sheetname: string);
    create(...components: Component[]): void;
    netlist(): void;
    net(name: string, ...pins: Pin[]): void;
    protected hier_pin(sheet_pin: Pin, ...pins: Pin[]): void;
    box(...box_object: KiCodeTextBox[]): void;
    component(component: Component): void;
    sheet(sheet: Sheet): void;
}
export declare class Sheet extends Schematic {
    coord: {
        x: number;
        y: number;
    };
    pin_list: HierPin[];
    pins_list: Pin[];
    Sheetname: string;
    Schematic: Schematic;
    constructor(name: string, owner: Schematic, x?: number, y?: number, ...pins: Pin[]);
    xy(x: number, y: number): void;
    add(): string;
    create(...components: Component[]): void;
    hier(sheet_pin: Pin, ...pins: Pin[]): void;
    pin(pin_name: string): Pin;
}
interface IPin {
    Number?: number;
    Name?: string | undefined;
    Owner?: Component | undefined;
    x?: number | undefined;
    y?: number | undefined;
    a?: number | undefined;
    type?: HierPinType | undefined;
    hier?: boolean | undefined;
    order?: number | undefined;
}
export declare class Pin {
    Number: number;
    Name: string;
    Owner: any;
    x: number;
    y: number;
    a: number;
    type: HierPinType;
    hier: boolean;
    hier_to_net: boolean;
    order: number;
    constructor({ Number, Name, Owner, x, y, a, hier, type, order }?: IPin);
}
export declare function Coord(coordinate: number): number;
export type Bounds = {
    x: number;
    y: number;
    w: number;
    h: number;
};
export declare function Box(n: number, nn?: number): Bounds;
/** Devices */
export declare enum Devices {
    /** small capacitor: p1, p2 */
    C_Small = "Device:C_Small",
    /** small diode: pin 1 anode, pin 2 cathode */
    D_Small = "Device:D_Small",
    /** small resistor: p1, p2 */
    R_Small = "Device:R_Small"
}
export {};
