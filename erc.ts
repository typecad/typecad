import { Schematic } from "./schematic";
import { Pin } from "./pin";
let errors: string[] = [];
let warnings: string[] = [];

import chalk from 'chalk';

/**
 * Performs electrical rule checks on a given schematic.
 * Logs errors and warnings based on pin connections.
 *
 * @param {Schematic} schematic - The schematic to perform ERC on.
 */
export function erc(schematic: Schematic) {
    // loop through all nodes checking each pin connection
    schematic.Nodes.forEach(_node => {
        erc_node_pin(_node.nodes);
        _node.nodes.forEach(pin => {
            _node.nodes.forEach(pin2 => {
                if (pin.reference === pin2.reference) {
                    return; // we don't need to check the pin against itself
                }
                erc_pin_pin(pin, pin2);
            });
        });
    });

    if (errors.length > 0) {
        errors.forEach(error => {
            process.stdout.write(chalk.whiteBright.bgRed(`👺 ERC error:`) +  ` ${error}` + '\n');
        });
    }

    if (warnings.length > 0) {
        warnings.forEach(warning => {
            process.stdout.write(chalk.whiteBright.bgYellow(`ERC warning:`) +  ` ${warning}` + '\n');
        });
    }

    process.stdout.write(chalk.bold.magentaBright('ERC') + ` ${errors.length} errors, ${warnings.length} warnings` + '\n');
    if (errors.length > 0) {
        process.exit(1);
    }
}

/**
 * Checks each node's pins to ensure that input and power input pins are driven by the appropriate output pins.
 *
 * @param {Pin[]} nodes - The array of pins in a node to check.
 */
function erc_node_pin(nodes: Pin[]) {
    // input pin not driven to any output pin
    nodes.forEach(pin => {
        if (pin.type === 'input') {
            const hasInput = nodes.some(pin2 => pin2.type === 'output');
            if (!hasInput) {
                errors.push(`input pin ${pin.reference}:${pin.number} not driven by an output pin`);
            }
        }
    });

    // input pin not driven to any output pin
    nodes.forEach(pin => {
        if (pin.type === 'power_in') {
            const hasInput = nodes.some(pin2 => pin2.type === 'power_out');
            if (!hasInput) {
                errors.push(`power_in pin ${pin.reference}:${pin.number} not driven by a power_out pin. Use [pin].type = 'power_out' to designate a power_out pin`);
            }
        }
    });

}

/**
 * Checks the connections between two pins and logs errors or warnings based on their types.
 *
 * @param {Pin} pin1 - The first pin to check.
 * @param {Pin} pin2 - The second pin to check.
 */
function erc_pin_pin(pin1: Pin, pin2: Pin) {
    // check pin-to-pin connections
    switch (pin1.type) {
        case 'input':
            if (pin2.type === 'unspecified') {
                warnings.push(`input pin ${pin1.reference}:${pin1.number} connected to unspecified pin ${pin2.reference}:${pin2.number}`);
            }
            break;
        case 'output':
            if (pin2.type === 'bidirectional') {
                errors.push(`output pin ${pin1.reference}:${pin1.number} connected to bidirectional pin ${pin2.reference}:${pin2.number}`);
            }
            break;
        case 'tri_state':
            if (pin2.type === 'output') {
                warnings.push(`tri_state pin ${pin1.reference}:${pin1.number} connected to output pin ${pin2.reference}:${pin2.number}`);
            }
            break;
        case 'unspecified':
            if (pin2.type !== 'free') {
                warnings.push(`unspecified pin ${pin1.reference}:${pin1.number} connected to non-free pin ${pin2.reference}:${pin2.number}`);
            }
            break;
        case 'power_in':
            if (pin2.type === 'tri_state') {
                warnings.push(`power_in pin ${pin1.reference}:${pin1.number} connected to tri_state pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'unspecified') {
                warnings.push(`power_in pin ${pin1.reference}:${pin1.number} connected to unspecified pin ${pin2.reference}:${pin2.number}`);
            }
            break;
        case 'power_out':
            if (pin2.type === 'output') {
                errors.push(`power_out pin ${pin1.reference}:${pin1.number} connected to output pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'bidirectional') {
                warnings.push(`power_out pin ${pin1.reference}:${pin1.number} connected to bidirectional pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'tri_state') {
                errors.push(`power_out pin ${pin1.reference}:${pin1.number} connected to tri_state pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'unspecified') {
                warnings.push(`power_out pin ${pin1.reference}:${pin1.number} connected to unspecified pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'power_out') {
                errors.push(`power_out pin ${pin1.reference}:${pin1.number} connected to power_out pin ${pin2.reference}:${pin2.number}`);
            }
            break;
        case 'open_collector':
            if (pin2.type === 'output') {
                errors.push(`open_collector pin ${pin1.reference}:${pin1.number} connected to output pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'tri_state') {
                warnings.push(`open_collector pin ${pin1.reference}:${pin1.number} connected to tri_state pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'unspecified') {
                warnings.push(`open_collector pin ${pin1.reference}:${pin1.number} connected to unspecified pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'power_out') {
                errors.push(`open_collector pin ${pin1.reference}:${pin1.number} connected to power_out pin ${pin2.reference}:${pin2.number}`);
            }
            break;
        case 'open_emitter':
            if (pin2.type === 'output') {
                errors.push(`open_collector pin ${pin1.reference}:${pin1.number} connected to output pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'bidirectional') {
                warnings.push(`open_collector pin ${pin1.reference}:${pin1.number} connected to bidirectional pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'tri_state') {
                warnings.push(`open_collector pin ${pin1.reference}:${pin1.number} connected to tri_state pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'unspecified') {
                warnings.push(`open_collector pin ${pin1.reference}:${pin1.number} connected to unspecified pin ${pin2.reference}:${pin2.number}`);
            }
            if (pin2.type === 'power_out') {
                errors.push(`open_emitter pin ${pin1.reference}:${pin1.number} connected to power_out pin ${pin2.reference}:${pin2.number}`);
            }
            break;
        case 'no_connect':
            // this works without an if statement because the calling function only calls this function if there is more than one pin
            warnings.push(`no_connect pin ${pin1.reference}:${pin1.number} connected to ${pin2.reference}:${pin2.number}`);
            break;
        default:
            break;
    }
}