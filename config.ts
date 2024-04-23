import fs from 'node:fs';
import process from 'node:process';
import chalk from 'chalk';

export class Config {
    #contents: any = '';

    #open() {
        try {
            if (fs.existsSync(process.cwd() + '/typecad.json') == false) {
                return this.#contents = '';
            }
    
            let config_text = fs.readFileSync(
                process.cwd() + '/typecad.json',
                "utf8"
            );
            this.#contents = JSON.parse(config_text);
        } catch (error) {
            console.log('- ', chalk.red.bold('ERROR: cannot read/process typecad.json. Try editing or deleting the file.'));
        }
        
    }

    get(key: string): string {
        this.#open();

        // exit if no config file
        if (this.#contents == '') return '';

        if (key in this.#contents) {
            return this.#contents[key]
        } else {
            return '';
        }
    }

    set(key: string, value: string): boolean {
        this.#open();

        // if there was no file, make a new object
        if (this.#contents == '') this.#contents = {};

        // update insert new key/value
        if (key in this.#contents) {
            this.#contents[key] = value;
        } else {
            this.#contents[key] = value;
        }

        try {
            fs.writeFileSync(process.cwd() + '/typecad.json', JSON.stringify(this.#contents));
        } catch (err) {
            console.error(err);
            return false;
        }

        return true;
    }
}