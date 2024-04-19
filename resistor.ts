import { Component } from '.'

export class Resistor extends Component {
  Wattage?:string;
  constructor(reference: string, value: string, wattage?: string){
    super("Device:R_Small", reference, value, "Resistor_SMD:R_0603_1608Metric");
    this.Wattage = wattage;
  }
}