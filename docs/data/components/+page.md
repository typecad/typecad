<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Components
In the [passives](https://www.npmjs.com/package/@typecad/passives) package, components are created with a couple properties that have been predetermined:
- footprint
- prefix

Doing that takes some of the effort out of creating common components. But all it was really doing was calling the `Component` class with a few properties already set.

## `Component`
The `Component` class is the base class for all components in **type**CAD. A component is anything added to the board. In KiCAD, it would be anything that has a footprint file associated with it.

<br>

<ScrollArea orientation="both">

```ts
import { Component } from '@typecad/typecad';

let u1 = new Component({ footprint: 'Package_SO:SOIC-8_5.3x5.3mm_P1.27mm' });
```
</ScrollArea>

The above creates a SOIC-8 component. `footprint` is the KiCAD footprint path and split into two strings. 

That method works well for simple components, but there is a better way using the `add-component` tool.

## `npx @typecad/add-component`
**type**CAD has a command line tool that can be used to create a component. It is in your project's `package.json` file, you can simply click the `Add Component` button in the VSCode GUI under `NPM Scripts`. If you're not using VSCode, you can run `npx @typecad/add-component ./src` from the `./hw` directory of your project.

The script will ask where the component is coming from, either the KiCAD library, a local file, or an EasyEDA/JLCPCB component. 

If you're using the KiCAD library, you'll be asked for the symbol library and name. Paste it in, press enter and it should automatically figure out which footprint to use. If it can't, it will ask you for a footprint library name and footprint name (library:footprint).

If you're using a local file, you'll be asked for the path to the symbol file and footprint file.

If it's an [EasyEDA/JLCPCB component](https://jlcpcb.com/parts), you'll be asked for the `C###` number.

### KiCAD Library Components
If you'll be creating a component that is in the KiCAD library, you need two pieces of information: 
- footprint library name
- component footprint name

Right now, the easiest way to get that information is to add the part you want to a schematic. For this example, we'll make an ATtiny85 MCU so add it to a KiCAD schematic. Select it and press `e`. You should see a dialog that looks like this:

![KiCAD Symbol Properties](/docs/attiny85.png)

The highlighted `Library link` text on the bottom has the information you need. The first part, before the `:` is the symbol library name (`MCU_Microchip_ATtiny`), the second part is the symbol name (`ATtiny85-20S`).

<br>

> [!important]
> Making components is the only point in **type**CAD where you need to deal with KiCAD symbols. It uses the information in them to create some boilerplate code for you. 

### Local File Components
If you're creating a component that is not in the KiCAD library, you need the symbol file (.kicad_sym) and footprint file (.kicad_mod) for the component. It is easiest to copy the files to your project directory. They can be deleted after the component is created.

### EasyEDA/JLCPCB Component
If you are working within JLC's ecosystem for design or assembly, you can use the `C###` numbers of their parts to create a component. The footprint and 3d model will be downloaded and a **type**CAD component will be created.

<br />

> [!WARNING]
> The parts are converted from EasyEDA's format to KiCAD's footprint. The conversion isn't always perfect. The most common issue is pin types being `unspecified` rather than what they should actually be. 

### Component Use
After the component is created, they'll be some code in the terminal that tells you how to `import` it and declare a `new` instance of it. For the ATtiny85, it will look like this:

<ScrollArea orientation="both">

```bash
# [!code word:import]
# [!code word:new]
🧩 typeCAD Create Component
✔ Component source? KiCAD
✔ Symbol name? MCU_Microchip_ATtiny:ATtiny3227-M
✔ Footprint name? Package_DFN_QFN:QFN-24-1EP_4x4mm_P0.5mm_EP2.6x2.6mm
Finished component creation, use it with:
 import { ATtiny85_20S } from './ATtiny85_20S';
 let u1 = new ATtiny85_20S();
```
</ScrollArea>

Let's look at what's in the `ATtiny85_20S.ts` file that was created to get a better idea of what is going on.

### `ATtiny85_20S.ts`
<ScrollArea orientation="both">

```ts
import { Component, Pin } from "@typecad/typecad";
/**
 | Pin # | Name         | Type              |
 | --:   | :--          | :--               |
 | 8     | VCC          | power_in          |
 | 4     | GND          | power_in          |
 | 5     | AREF_PB0     | bidirectional     |
 | 6     | PB1          | bidirectional     |
 | 7     | PB2          | bidirectional     |
 | 2     | XTAL1_PB3    | bidirectional     |
 | 3     | XTAL2_PB4    | bidirectional     |
 | 1     | _RESET_PB5   | bidirectional     |
 */
export class ATtiny85_20S extends Component {
    VCC = new Pin(this.reference, 8, 'power_in');
    GND = new Pin(this.reference, 4, 'power_in');
    AREF_PB0 = new Pin(this.reference, 5, 'bidirectional');
    PB1 = new Pin(this.reference, 6, 'bidirectional');
    PB2 = new Pin(this.reference, 7, 'bidirectional');
    XTAL1_PB3 = new Pin(this.reference, 2, 'bidirectional');
    XTAL2_PB4 = new Pin(this.reference, 3, 'bidirectional');
    _RESET_PB5 = new Pin(this.reference, 1, 'bidirectional');
    
    constructor(reference?: string | undefined) {
        super({ reference, footprint: "Package_SO:SOIC-8_5.3x5.3mm_P1.27mm" });
    }
}
```
</ScrollArea>

It is a bit more involved than the simple TypeScript we've been using so far (that's why it was auto-generated). But it helps to explain what is going on.

The file `extends` the `Component` by adding some extras to it. In particular, it adds `Pin` objects to the component. Rather than using the pins like `u1.pin(1)`, we can use `u1.VCC` for the VCC pin, or `u1.GND` for the GND pin. This makes the code much easier to read and understand. 


## `add`
After a `Component` has been created and modified, call `add` to include it in the schematic and netlist. 

<ScrollArea orientation="both">

```ts
import { Schematic } from '@typecad/typecad';
import { ATtiny85_20S } from './ATtiny85_20S';

let typecad = new Schematic('typecad_docs');
let u1 = new ATtiny85_20S();

typecad.add(u1);        // method 1
// --or--
typecad.create(u1, ...);    // method 2
```
</ScrollArea>

The `add` method adds the component explicitly and the `::create(...)` method adds them all at once just prior to building. Functionally, there is no difference, but if a components are being created dynamically, it is useful to have a method to add them. 

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/pins" class={buttonVariants({ variant: "outline" })}>Pins<ChevronRight /></a>
    </p>
</div>