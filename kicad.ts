import fs from 'node:fs';
import { platform } from 'node:os';
import {lookpathSync} from 'find-bin';

export let kicad_path: string | undefined;
export let kicad_cli_path: string | undefined;

export class KiCAD {
    #possible_paths: string[] = [
        'C:/Program Files/KiCad/8.0/',                                  // windows
        '/usr/share/kicad/',                                            // linux
        '/Applications/KiCAD/KiCad.app/Contents/ShareSupport/'          // mac?
    ]

    constructor() {
        this.#possible_paths.forEach((path) => {
            if (fs.existsSync(path)) {
                kicad_path = path; // share/kicad/symbols
            }
        });

        // if it found a path, figure out where 'kicad-cli' is
        if (kicad_path) {
            if (platform() == 'win32') {
                console.log('windows')
                kicad_cli_path = kicad_path + 'bin/kicad-cli.exe';
            } else {
                // whereis
                kicad_cli_path = lookpathSync('kicad-cli');
            }
        }
    }
}