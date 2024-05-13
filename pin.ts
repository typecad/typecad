import { Component } from ".";

/**
 * Used internally
 * @ignore
 */
type HierPinType = "passive" | "input" | "output" | "bidirectional" | "tri_state";
/**
 * Used internally
 * @ignore
 */
export type HierPin = { name: string; type: HierPinType, x: any; y: any; a: number }

/**
 * Used internally
 * @ignore
 */
export interface IPin {
    Number?: number | string,
    Name?: string | undefined,
    Owner?: Component | undefined,
    x?: number | undefined,
    y?: number | undefined,
    a?: number | undefined,
    type?: HierPinType | undefined;
    hier?: boolean | undefined;
    order?: number | undefined;
    sheet?: boolean | undefined;
}


export class Pin {
    Number: number | string = -1;
    Name: string = '';
    Owner: any = undefined;
    x: number = -1;
    y: number = -1;
    a: number = 180;
    type: HierPinType = {} as HierPinType;
    hier: boolean = false;
    hier_to_net: boolean = false;
    order: number = 1;
    sheet: boolean = false;

    constructor({ Number, Name, Owner, x, y, a, hier, type, order, sheet }: IPin = {}) {
        if (Number != undefined) this.Number = Number;
        if (Name != undefined) this.Name = Name;
        if (Owner != undefined) this.Owner = Owner;
        if (x != undefined) this.x = x;
        if (y != undefined) this.y = y;
        if (a != undefined) this.a = a;
        if (hier != undefined) this.hier = hier;
        if (type != undefined) {
            this.type = type;
        } else {
            this.type = 'passive';
        }
        if (order != undefined) this.order = order;
        if (x != undefined) this.hier_to_net = true;
        if (sheet != undefined) this.sheet = sheet;
    }
}