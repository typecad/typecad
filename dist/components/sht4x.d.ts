import { Component, Pin, Bounds } from '..';
export declare class SHT4x extends Component {
    Footprint: string;
    Reference: string;
    SDA: Pin;
    SCL: Pin;
    VDD: Pin;
    VSS: Pin;
    constructor(nn: Bounds);
}
