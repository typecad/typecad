<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

    let { data }: { data: PageData } = $props();
</script>

# Board Layout
**type**CAD can help with board layout. As of now there are some limitations:
- only `Component`s can be placed
- if you apply a layout, move the components, then apply the layout again, they will revert to their code-specified positions
- when a board has a layout applied, all components are removed and only components present in the code will be in the netlist

## Recommended workflow
1. If you're using a **type**CAD package that includes a board layout
2. `import` and configure as usual
3. At the end of the main file, run `::place` and build. This will populate the board with the components as the package specifies.
4. Remove the `::group` or `::place` line

When you open the board in KiCAD, you'll see the components placed. Import the netlist and you'll see their connections to continue the layout process. 

## `PCB`
Here is the minimal code to create a PCB.

<ScrollArea orientation="both">

```ts
import { PCB } from '@typecad/typecad';
let pcb = new PCB('typecad_docs');

// add components to the PCB
pcb.create();
```
</ScrollArea>

After running the code, there will be a `typecad_docs.kicad_pcb` file in `./build`. 

## PCB Coordinates
Each `Component` has a `pcb` property that contains `{x, y, rotation}`. That's how the component's location is specified. You can take them directly from KiCAD when you're finished laying out the components. 

<ScrollArea orientation="both">

```ts
import { PCB } from '@typecad/typecad';
import { Resistor } from '@typecad/passives/0805'

let r1 = new Resistor({ value: '1kohm', reference: 'R1' });
let pcb = new PCB('typecad_docs');

r1.pcb = { x: 10, y: 10, rotation: 0 };// [!code highlight]
pcb.create();
```
</ScrollArea>

## Group or Place Components
In KiCAD, you can group components together. They will move around together when you click and drag anywhere in the group. There is also a labeled box around the components. 

To accomplish this for a group of related components:
<ScrollArea orientation="both">

```ts
import { PCB } from '@typecad/typecad';
import { Resistor } from '@typecad/passives/0805'

let r1 = new Resistor({ value: '1kohm', reference: 'R1' });
let pcb = new PCB('typecad_docs');

r1.pcb = { x: 10, y: 10, rotation: 0 };
pcb.group('typecad_docs', r1);// [!code highlight]
pcb.create();
```
</ScrollArea>

Or to place them:

<ScrollArea orientation="both">

```ts
import { PCB } from '@typecad/typecad';
import { Resistor } from '@typecad/passives/0805'

let r1 = new Resistor({ value: '1kohm', reference: 'R1' });
let pcb = new PCB('typecad_docs');

r1.pcb = { x: 10, y: 10, rotation: 0 };
pcb.group('typecad_docs', r1);// [!code --]
pcb.place(r1);// [!code ++]
pcb.create();
```
</ScrollArea>

### **type**CAD Package Layouts
The tooling for creating packages includes a standardized code structure for using board layouts. Packages have a property that accepts a `PCB` object. They also have a `::place()` function that places the components and calls `PCB::create()`. This method works well and allows for any number of packages to be used with the same board.
