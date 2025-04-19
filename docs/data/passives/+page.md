<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Passives
To simplify adding components, the most common components: resistors, capacitors, etc, have been packaged into [@typecad/passives](https://www.npmjs.com/package/@typecad/passives). It is automatically installed when a project is created.

## Sizes
The [@typecad/passives](https://www.npmjs.com/package/@typecad/passives) package is organized by component size.

<ScrollArea orientation="both">

```ts
import { Resistor, LED, Capacitor, Diode, Inductor, Fuse } from '@typecad/passives/0805'

let r1 = new Resistor({ value: '1kohm', reference: 'R1' });
```
</ScrollArea>

Will import all the components in the 0805 size.

To import 0603 components, use:

<ScrollArea orientation="both">

```ts
import { Resistor, LED, Capacitor, Diode, Inductor, Fuse } from '@typecad/passives/0603'// [!code word:0603:1]
```
</ScrollArea>

All of the sizes are:

- @typecad/passives/1210
- @typecad/passives/1206
- @typecad/passives/0805
- @typecad/passives/0603
- @typecad/passives/0402
- @typecad/passives/0201 **no fuses*

### Multi-sizes
To import multiple sizes, use this `import` statement syntax:

<ScrollArea orientation="both">

```ts
// [!code word:* as _0603]
// [!code word:* as _0805]
import * as _0603 from '@typecad/passives/0603'
import * as _0805 from '@typecad/passives/0805'

let r1 = new _0603.Resistor({ value: '1kohm' }); 
let c2 = new _0805.Capacitor({ value: '1uF' });
```
</ScrollArea>
<br >

> [!tip]
> `_0603` and `_0805` can be changed to any TypeScript-legal name.

## Reference Designators
KiCAD tracks components by their reference designator. This is the name that appears on the schematic and the PCB. In the `passives` package, the `reference` property is how components are referenced. It is not a required property of any `passives` component, if it is not passed, one will automatically generated.

Auto-generation works as follows:
- if `reference` is passed, it will be used. If there is a name conflict, it will be renamed and a warning will be logged in the build output.
- if `reference` is not passed, it will create one using the `prefix` property and an internal counter by type of component. ie the first resistor will be `R1`, the second resistor will be `R2`, etc. 
- if the `prefix` property is not passed, it will be `R` by default for resistors, `C` for capacitors, `L` for inductors, etc.

<br >

> [!warning]
> Because ultimately, KiCAD is tracking components by reference designator, components will sometimes swap reference designators with eachother based on when the **type**CAD build process encounters it during the build process. This only happens when a similar component is created before an already laid-out component. 

## Unique Footprints
Sometimes, passive components will have a unique footprint. To use that footprint with this package:
1. copy the footprint file (.kicad_mod) into ./hw/src/build/lib/footprints
2. use it in your `new` component:

<ScrollArea orientation="both">

```ts
import { Inductor } from '@typecad/passives/0805'
let l1 = new Inductor({ value: '1uH', footprint: 'unique_inductor_footprint' });
```
</ScrollArea>

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/components" class={buttonVariants({ variant: "outline" })}>Components<ChevronRight /></a>
    </p>
</div>