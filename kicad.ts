import fs from 'node:fs';
import { platform } from 'node:os';
import {lookpathSync} from 'find-bin';
import { Config } from './config'
let conf = new Config();

export let kicad_path: string | undefined;
export let kicad_cli_path: string | undefined;

export class KiCAD {
    #possible_paths: string[] = [
        'C:/Program Files/KiCad/7.0/',                                  // windows
        'C:/Program Files/KiCad/8.0/',
        '/usr/share/kicad/',                                            // linux
        '/Applications/KiCAD/KiCad.app/Contents/ShareSupport/'          // mac?
    ]

    constructor() {
        // push typecad.json#kicad_path into the list to check
        this.#possible_paths.push(conf.get('kicad_path'));

        this.#possible_paths.forEach((path) => {
            if (fs.existsSync(path)) {
                kicad_path = path; // share/kicad/symbols
            }
        });

        // if it found a path, figure out where 'kicad-cli' is
        if (kicad_path) {
            if (platform() == 'win32') {
                kicad_cli_path = kicad_path + 'bin/kicad-cli.exe';
            } else {
                // whereis
                kicad_cli_path = lookpathSync('kicad-cli');
            }

            // if typecad.json#kicad_cli is set, use it
            if (conf.get("kicad_cli") != '') kicad_cli_path = conf.get("kicad_cli");
        }
    }
}