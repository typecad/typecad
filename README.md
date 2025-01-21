![typeCAD logo](https://typecad.net/typecad.svg)
# [**type**CAD](https://typecad.net)

##  KiCAD + TypeScript + npm = **type**CAD
> typeCAD is a way to programmatically create hardware designs.

It's done with TypeScript and all the awesomeness of the npm/Node.js ecosystem.

- npm packages can be imported into your projects
- create portable/importable/shareable packages
- semantic version control

The schematic portion of hardware design is replaced with a few simple TypeScript classes. Rather than clicking and dragging, a line of code creates a component, and another line connects it. Sections of code can be turned into reusable modules and those modules can be turned into npm packages.

Code can be version controlled, status tracked, git push/pull/PR/issues can be used, and all the typical tools for software design can be used for hardware design now

## Example
_This **type**CAD code..._
```ts
import { Schematic, Component } from '@typecad/typecad'
import { Resistor, LED } from '@typecad/passives/0805'

let typecad = new Schematic('typecad');
let bt1 = new Component({ footprint: 'BatteryHolder_Keystone_500' });
let r1 = new Resistor({ value: "1 kOhm" });
let d1 = new LED();

typecad.named('vin').net(bt1.pin(1), r1.pin(1));
typecad.net(r1.pin(2), d1.pin(2));
typecad.named('gnd').net(d1.pin(1), bt1.pin(2));

typecad.create(r1, d1, bt1);
typecad.netlist();
```

_...is the same as this schematic._

![simple led circuit](https://typecad.net/led-circuit.png)

>The difference is that code can be copied, turned into reusable packages, version controlled, and used within the npm/Node.js system.

## Get started
Read through the [documentation](https://typecad.net/docs/walkthrough/get-started) for a full walkthrough:

```bash
npx @typecad/create-typecad
```

---
## Support
<a href="https://www.buymeacoffee.com/typecad" target="_blank" title="buymeacoffee">
  <img src="https://iili.io/JoQl86x.md.png"  alt="buymeacoffee-green-badge" style="width: 204px;">
</a>