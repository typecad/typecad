import chalk from 'chalk';

type TPinType = "passive" | "input" | "output" | "bidirectional" | "tri_state" | "power_in" | "unspecified" | "power_out" | "free" | "open_collector" | "open_emitter" | "no_connect";

export class Pin {
    number: number | string = '';
    reference: string = '';
    type: TPinType;

    constructor(reference: string, number: number | string, type?: TPinType) {
        this.reference = reference;
        this.number = number;
        this.type = type || 'passive';
    }
}