import { Component, Pin } from "@typecad/typecad";

/**
 | Pin # | Name | Type          |
 | --:   | :--  | :--           |
 | 1     | GND_1  | passive      |
 | 2     | GND_2  | passive      |
 | 3     | _3V3  | passive      |
 | 4     | IO0  | passive      |
 | 5     | IO1  | passive      |
 | 6     | IO2  | passive      |
 | 7     | IO3  | passive      |
 | 8     | IO4  | passive      |
 | 9     | IO5  | passive      |
 | 10     | IO6  | passive      |
 | 11     | IO7  | passive      |
 | 12     | IO8  | passive      |
 | 13     | IO9  | passive      |
 | 14     | IO10  | passive      |
 | 15     | IO11  | passive      |
 | 16     | IO12  | passive      |
 | 17     | IO13  | passive      |
 | 18     | IO14  | passive      |
 | 19     | IO15  | passive      |
 | 20     | IO16  | passive      |
 | 21     | IO17  | passive      |
 | 22     | IO18  | passive      |
 | 23     | IO19  | passive      |
 | 24     | IO20  | passive      |
 | 25     | IO21  | passive      |
 | 26     | IO26  | passive      |
 | 27     | IO47  | passive      |
 | 28     | IO33  | passive      |
 | 29     | IO34  | passive      |
 | 30     | IO48  | passive      |
 | 31     | IO35  | passive      |
 | 32     | IO36  | passive      |
 | 33     | IO37  | passive      |
 | 34     | IO38  | passive      |
 | 35     | IO39  | passive      |
 | 36     | IO40  | passive      |
 | 37     | IO41  | passive      |
 | 38     | IO42  | passive      |
 | 39     | TXD0  | passive      |
 | 40     | RXD0  | passive      |
 | 41     | IO45  | passive      |
 | 42     | GND_3  | passive      |
 | 43     | GND_4  | passive      |
 | 44     | IO46  | passive      |
 | 45     | EN  | passive      |
 | 46     | GND_5  | passive      |
 | 47     | GND_6  | passive      |
 | 48     | GND_7  | passive      |
 | 49     | GND_8  | passive      |
 | 50     | GND_9  | passive      |
 | 51     | GND_10  | passive      |
 | 52     | GND_11  | passive      |
 | 53     | GND_12  | passive      |
 | 54     | GND_13  | passive      |
 | 55     | GND_14  | passive      |
 | 56     | GND_15  | passive      |
 | 57     | GND_16  | passive      |
 | 58     | GND_17  | passive      |
 | 59     | GND_18  | passive      |
 | 60     | GND_19  | passive      |
 | 61     | GND_20  | passive      |
 | 62     | GND_21  | passive      |
 | 63     | GND_22  | passive      |
 | 64     | GND_23  | passive      |
 | 65     | GND_24  | passive      |
 | 66     | GND_25  | passive      |
 | 67     | GND_26  | passive      |
 | 68     | GND_27  | passive      |
 | 69     | GND_28  | passive      |
 | 70     | GND_29  | passive      |
 | 71     | GND_30  | passive      |
 | 72     | GND_31  | passive      |
 | 73     | GND_32  | passive      |
 */
 export class ESP32_S3_MINI_1_N8 extends Component {
    GND_1 = new Pin(this.reference, 1, 'power_in');
    GND_2 = new Pin(this.reference, 2, 'power_in');
    _3V3 = new Pin(this.reference, 3, 'power_in');
    IO0 = new Pin(this.reference, 4, 'bidirectional');
    IO1 = new Pin(this.reference, 5, 'bidirectional');
    IO2 = new Pin(this.reference, 6, 'bidirectional');
    IO3 = new Pin(this.reference, 7, 'bidirectional');
    IO4 = new Pin(this.reference, 8, 'bidirectional');
    IO5 = new Pin(this.reference, 9, 'bidirectional');
    IO6 = new Pin(this.reference, 10, 'bidirectional');
    IO7 = new Pin(this.reference, 11, 'bidirectional');
    IO8 = new Pin(this.reference, 12, 'bidirectional');
    IO9 = new Pin(this.reference, 13, 'bidirectional');
    IO10 = new Pin(this.reference, 14, 'bidirectional');
    IO11 = new Pin(this.reference, 15, 'bidirectional');
    IO12 = new Pin(this.reference, 16, 'bidirectional');
    IO13 = new Pin(this.reference, 17, 'bidirectional');
    IO14 = new Pin(this.reference, 18, 'bidirectional');
    IO15 = new Pin(this.reference, 19, 'bidirectional');
    IO16 = new Pin(this.reference, 20, 'bidirectional');
    IO17 = new Pin(this.reference, 21, 'bidirectional');
    IO18 = new Pin(this.reference, 22, 'bidirectional');
    IO19 = new Pin(this.reference, 23, 'bidirectional');
    IO20 = new Pin(this.reference, 24, 'bidirectional');
    IO21 = new Pin(this.reference, 25, 'bidirectional');
    IO26 = new Pin(this.reference, 26, 'bidirectional');
    IO47 = new Pin(this.reference, 27, 'bidirectional');
    IO33 = new Pin(this.reference, 28, 'bidirectional');
    IO34 = new Pin(this.reference, 29, 'bidirectional');
    IO48 = new Pin(this.reference, 30, 'bidirectional');
    IO35 = new Pin(this.reference, 31, 'bidirectional');
    IO36 = new Pin(this.reference, 32, 'bidirectional');
    IO37 = new Pin(this.reference, 33, 'bidirectional');
    IO38 = new Pin(this.reference, 34, 'bidirectional');
    IO39 = new Pin(this.reference, 35, 'bidirectional');
    IO40 = new Pin(this.reference, 36, 'bidirectional');
    IO41 = new Pin(this.reference, 37, 'bidirectional');
    IO42 = new Pin(this.reference, 38, 'bidirectional');
    TXD0 = new Pin(this.reference, 39, 'bidirectional');
    RXD0 = new Pin(this.reference, 40, 'bidirectional');
    IO45 = new Pin(this.reference, 41, 'passive');
    GND_3 = new Pin(this.reference, 42, 'passive');
    GND_4 = new Pin(this.reference, 43, 'passive');
    IO46 = new Pin(this.reference, 44, 'bidirectional');
    EN = new Pin(this.reference, 45, 'bidirectional');
    GND_5 = new Pin(this.reference, 46, 'power_in');
    GND_6 = new Pin(this.reference, 47, 'power_in');
    GND_7 = new Pin(this.reference, 48, 'power_in');
    GND_8 = new Pin(this.reference, 49, 'power_in');
    GND_9 = new Pin(this.reference, 50, 'power_in');
    GND_10 = new Pin(this.reference, 51, 'power_in');
    GND_11 = new Pin(this.reference, 52, 'power_in');
    GND_12 = new Pin(this.reference, 53, 'power_in');
    GND_13 = new Pin(this.reference, 54, 'power_in');
    GND_14 = new Pin(this.reference, 55, 'power_in');
    GND_15 = new Pin(this.reference, 56, 'power_in');
    GND_16 = new Pin(this.reference, 57, 'power_in');
    GND_17 = new Pin(this.reference, 58, 'power_in');
    GND_18 = new Pin(this.reference, 59, 'power_in');
    GND_19 = new Pin(this.reference, 60, 'power_in');
    GND_20 = new Pin(this.reference, 61, 'power_in');
    GND_21 = new Pin(this.reference, 62, 'power_in');
    GND_22 = new Pin(this.reference, 63, 'power_in');
    GND_23 = new Pin(this.reference, 64, 'power_in');
    GND_24 = new Pin(this.reference, 65, 'power_in');
    GND_25 = new Pin(this.reference, 66, 'power_in');
    GND_26 = new Pin(this.reference, 67, 'power_in');
    GND_27 = new Pin(this.reference, 68, 'power_in');
    GND_28 = new Pin(this.reference, 69, 'power_in');
    GND_29 = new Pin(this.reference, 70, 'power_in');
    GND_30 = new Pin(this.reference, 71, 'power_in');
    GND_31 = new Pin(this.reference, 72, 'power_in');
    GND_32 = new Pin(this.reference, 73, 'power_in');
     constructor(reference: string | undefined) {
         super({ reference, footprint: "lib:ESP32S3MINI1N8" });
     }
 }