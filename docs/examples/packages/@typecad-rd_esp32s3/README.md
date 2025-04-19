## rd-ESP32S3
> The reference design for the [ESP32-S3-MINI-1-N8](https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf). A module that provides 2.4 GHz b/g/n WiFi and BLE 5 connectivity, MCU, and PCB antenna. 

## Installation

```bash
npm i @typecad/rd_esp32s3
```
### Input Connections
 - power_supply: `Power` - 3.3 volt power supply

### Defined Output Connections
 - i2c: `I2C` - sda:IO8, scl:IO9
 - uart_0: `UART` - rx:RXD0, tx:TXD0, rts:IO15, cts:IO16
 - uart_1: `UART` - rx:IO18, tx:IO17, rts:IO19, cts:IO20
 - usb: `USB` - dp:IO20, dn:IO19

### Components
- U1: `ESP32_S3_MINI_1_N8` - Main IC
- C1: `_0603.Capacitor`- Bulk capacitor
- C3: `_0603.Capacitor` - Decoupling capacitor
- C2: `_0603.Capacitor`- Part of RC circuit for U1:EN
- R1: `_0603.Resistor`- Part of RC circuit for U1:EN
- C8: `_0603.Capacitor`- Debounce for SW1
- R7: `_0603.Resistor` - Debounce for SW1
- SW1: `Component` - Button to reset IC

## Use

1. Import the package

```ts
import { Schematic, Power, PCB   } from '@typecad/typecad';
import { rd_esp32s3 } from "@typecad/rd_esp32s3";
```

2. (optional) Declare a `Power` object to power the ESP32-S3

```ts
let vin = new Power({...});
```

3. Make the package.

```ts
let esp32s3 = new rd_esp32s3({ schematic: typecad });
```

4. `::add()` it

```ts
esp32s3.add();
```

### Default Layout
This package contains a default layout for all the components. The `PCB` class can be shared between multiple packages. 

```ts
...
let pcb = new PCB('rd_esp32s3_implementation');
let esp32s3 = new rd_esp32s3({schematic: typecad, pcb: pcb });
esp32s3.add();
esp32s3.place();
```

After building, there will be `rd_esp32s3_implementation.kicad_pcb` file in the `build` directory. Keep in mind that each time esp32s3.place() is called, the layout will be updated with the default component locations, discarding any changes you may have made. Setting it once, building, then removing it is the recommended workflow.

### Passives

The default size for the passive components is 0603, but it can be changed by passing a different set of passives.

```ts
import * as _0805 from '@typecad/passives/0805';
let esp = new rd_esp32s3({schematic: typecad, passives: _0805});

```