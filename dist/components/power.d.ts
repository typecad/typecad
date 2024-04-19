import { Component, Pin } from '..';
export declare class P10V extends Component {
    Reference: string;
    Value: string;
    pin1: Pin;
}
export declare class VCC extends Component {
    Footprint: string;
    Reference: string;
    vcc: Pin;
}
export declare class GND extends Component {
    Footprint: string;
    Reference: string;
    gnd: Pin;
}
