<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

    let { data }: { data: PageData } = $props();
</script>

# Package Use
Now that we've created a package, we need to know how to use it. 

## Self-documenting
A benefit of TypeScript is that you can write a lot of documentation in the code itself. You'll notice the JSDoc comments in the package code. This will result in VSCode hints and tips as you write the code, explaining parameters and providing examples. 

## Copying files
Refer to the [structure](../package/structure) section for the file structure of a package, particularly the `postinstall.js` file. KiCAD expects symbols and footprints to be in the `./build` directory, but we haven't actually `npm install`ed the package, so those files will need to be manually copied there. 

## `import`
The tooling gave us the `import` statement for the package.

<ScrollArea orientation="both">

```ts
import { typecad_package } from "./typecad_package";
```
</ScrollArea>

## `new`
Now create a new instance of the package.

<ScrollArea orientation="both">

```ts
import { Schematic } from '@typecad/typecad';
import { typecad_package } from "./typecad_package";
import * as _0805 from '@typecad/passives/0805'

let typecad = new Schematic('typecad_docs');
let u1 = new typecad_package({ schematic: typecad });                           // schematic is required
let u1 = new typecad_package({ schematic: typecad, reference: 'U1' });          // specify the reference designator
let u1 = new typecad_package({ schematic: typecad, passives: _0805 });          // change passives to 0805
let u1 = new typecad_package({ schematic: typecad, pcb: pcb });                 // include PCB
```
</ScrollArea>

## Connections
After creating the instance, you'll probably want to connect the package's components to something. You can access the pins of any component in the package.

<ScrollArea orientation="both">

```ts
u1.U1.GND // the ground pin of the ATtiny3227
u1.U1.VCC // the power pin of the ATtiny3227
```
</ScrollArea>

## `add`
After the package has been `import`ed and a `new` instance created, configuration is done, and connections made, you `add` it to the schematic.

<ScrollArea orientation="both">

```ts
import { Schematic } from '@typecad/typecad';
import { typecad_package } from "./typecad_package";
let typecad = new Schematic('typecad_docs');

let u1 = new typecad_package({ schematic: typecad });

u1.add();
```
</ScrollArea>
The package's components will be added to the schematic.

## `place`
If the package includes a layout, you can use it like this:

<ScrollArea orientation="both">

```ts
import { PCB, Schematic } from '@typecad/typecad';
import { typecad_package } from "./typecad_package";
let typecad = new Schematic('typecad_docs');
let pcb = new PCB('typecad_docs');

let u1 = new typecad_package({ schematic: typecad });

u1.add();
u1.place();
```
</ScrollArea>

## Do Not Populate
If a package includes a component you don't want included in the netlist or layout:

<ScrollArea orientation="both">

```ts
let u1 = new typecad_package({ schematic: typecad });
u1.U1.dnp = true;
```
</ScrollArea>
