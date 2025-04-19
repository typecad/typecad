import chalk from 'chalk';

/**
 * Type representing the possible types of a pin.
 *
 * @typedef {"passive" | "input" | "output" | "bidirectional" | "tri_state" | "power_in" | "unspecified" | "power_out" | "free" | "open_collector" | "open_emitter" | "no_connect"} TPinType
 */
type TPinType = "passive" | "input" | "output" | "bidirectional" | "tri_state" | "power_in" | "unspecified" | "power_out" | "free" | "open_collector" | "open_emitter" | "no_connect";

/**
 * Class representing a pin in a schematic.
 *
 * @class Pin
 */
export class Pin {
    number: number | string = '';
    reference: string = '';
    type: TPinType;

    /**
     * Initializes a new pin with a given reference, number, and optional type.
     *
     * @param {string} reference - The reference identifier for the pin.
     * @param {number|string} number - The pin number or identifier.
     * @param {TPinType} [type] - The type of the pin. Defaults to 'passive'.
     * @example
     * ```ts
     * let pin = new Pin('R1', 1, 'input');
     * ```
     */
    constructor(reference: string, number: number | string, type?: TPinType) {
        this.reference = reference;
        this.number = number;
        this.type = type || 'passive';
    }
}