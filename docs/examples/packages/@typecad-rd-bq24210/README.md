# rd-bq24210 **type**CAD Package

[bq24210 Datasheet](https://www.ti.com/lit/ds/symlink/bq24210.pdf)

> bq24210 800-mA, Single-Input, Single-Cell Li-Ion Battery Solar Charger

This is the `Reference Design` of the bq24210 in *Section 9.2 Typical Application* of the datasheet.

## Features

- 20-V Input Rating, With Overvoltage Protection
- 1% Battery Voltage Regulation Accuracy
- Current Charge up to 800 mA
- NTC Input Monitoring
- Status Indication – Charging/Power Present

## Installation

```bash
npm i @typecad/rd-bq24210
```

## Inputs

- `charge:Power`: a voltage source for charging, 4 - 20 volts.
- `battery:Power`: A single-cell Li-Ion battery

## Outputs
- `U1:BAT`: Battery connection/system power
- `CHG`: HIGH while charging, LOW when not charging
- `PG`: HIGH when charging voltage source present, LOW when not present

## Use

1. Import the packages

```ts
import { Schematic, Power } from '@typecad/typecad';
import { rd_bq24210 } from '@typecad/rd-bq24210';
```

2. Declare a charging source `Power` object

```ts
let solar_panel = new Power({...});
```

3. Declare a  battery `Power` object

```ts
let battery = new Power({...});
```

4. Make the bq24210 design.

```ts
let bq24210 = new rd_bq24210({schematic: typecad, charge: solar_panel, battery: battery});
```

5. `::add()` it

```ts
bq24210.create();          // bq.create(true) to run ERC
```
### Default Layout
This package contains a default layout for all the components. The `PCB` class can be shared between multiple packages. 

```ts
...
let pcb = new PCB('rd_bq24210_implementation');
let bq24210 = new rd_esp32s3({schematic: typecad, pcb: pcb });
esp32s3.add();
esp32s3.place();
```

After building, there will be `rd_bq24210_implementation.kicad_pcb` file in the `build` directory. Keep in mind that each time bq24210.place() is called, the layout will be updated with the default component locations, discarding any changes you may have made. Setting it once, building, then removing it is the recommended workflow.

### Passives

The default size for the passive components is 0603, but it can be changed by passing a different set of passives.

```ts
import * as _0805 from '@typecad/passives/0805';
let bq24210 = new rd_bq24210({schematic: typecad, passives: _0805});
```

## Design Considerations

### NTC
The bq24210 can use a 10K NTC to monitor the battery temperature. This design uses a 10K resistor (`R5`) making it appear the battery is always 25 C. To use a battery-attached NTC, it should connect `R5.pin(1)` to either pin of the NTC and the other side to ground.

### Charge Current
This IC allows for the charging current to be set with a resistor. The default for this package is 800 mA, which is also the maximum supported.

The charging current can be specified:
```ts
let bq24210 = new rd_bq24210({schematic: typecad, charge: vin, battery: battery, charge_current: 600});
```
Sets the charging current to 800 mA, the maximum supported by the IC. This has the effect of changing the value of `R4`. Currently, **type**CAD doesn't normalize computed resistor/capacitor values to standard EIA values.

The formula for calculating the resistor value is:
```
(390 / [requested charge current in mA]) * 100;
```