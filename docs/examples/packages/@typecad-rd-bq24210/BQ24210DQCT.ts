/**
 | Pin # | Name | Type          |
 | --:   | :--  | :--           |
 | 1     | VBUS  | passive      |
 | 2     | ISET  | passive      |
 | 3     | VSS  | passive      |
 | 4     | VTSB  | passive      |
 | 5     | TS  | passive      |
 | 11     | EP  | passive      |
 | 10     | BAT  | passive      |
 | 9     | VDPM  | passive      |
 | 8     | CHG  | passive      |
 | 7     | EN  | passive      |
 | 6     | PG  | passive      |
 */
import { Component, Pin } from "@typecad/typecad";
export class BQ24210DQCT extends Component {
    VBUS = new Pin(this.reference, 1, 'power_in');
    ISET = new Pin(this.reference, 2);
    VSS = new Pin(this.reference, 3, 'power_in');
    VTSB = new Pin(this.reference, 4);
    TS = new Pin(this.reference, 5);
    EP = new Pin(this.reference, 11, 'power_in');
    BAT = new Pin(this.reference, 10);
    VDPM = new Pin(this.reference, 9);
    CHG = new Pin(this.reference, 8, 'output');
    EN = new Pin(this.reference, 7, 'output');
    PG = new Pin(this.reference, 6, 'output');
    
    constructor(reference: string | undefined, footprint: string = "lib:SON50P200X300X80-11N") {
        super({ symbol: "BQ24210DQCT:BQ24210DQCT", reference, footprint });
    }
}