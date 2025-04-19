<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Code
If we continue to use the ATtiny3227 as an example, we can see the code that is generated for the component in `index.ts`.

<ScrollArea orientation="both">

```ts
import * as _0603 from '@typecad/passives/0603';
import { Schematic, PCB } from '@typecad/typecad';
import { ATtiny3227_M } from './ATtiny3227_M';

interface Itypecad_package {
    schematic?: Schematic,
    reference?: string,
    passives?: typeof _0603
    pcb?: PCB;
};

/**
 * ### typecad_package - Description
 * 
 * #### Input Connections
 * 
 * #### Output Connections
 * 
 */
export class typecad_package {
    #schematic: Schematic;
    #passives: typeof _0603;
    pcb: PCB;
    U1: ATtiny3227_M;

    constructor({ schematic, reference, passives, pcb }: Itypecad_package = {}) {
        if (schematic) {
            this.#schematic = schematic;
        } else {
            throw new Error('schematic: Schematic is a required typeCAD parameter');
        }
        this.#passives = passives || _0603;
        if (pcb) this.pcb = pcb;

        this.U1 = new ATtiny3227_M(reference);
    }

    add() {
        // create connections here
        // avoid using ::named() in favor of simply using ::net()

        // add components to schematic
        this.#schematic.add(this.U1);
    }

    place(pcb?: PCB) {
        if (pcb) this.pcb = pcb;

        this.U1.pcb = { x: 149.339, y: 100.838, rotation: 0 };

        this.pcb.group('typecad_package', this.U1);
        this.pcb.create();
    }
}
```
</ScrollArea>

It seems like a lot of code. Let's break it into smaller pieces and describe what it does.

## `import`
<ScrollArea orientation="both">

```ts
import * as _0603 from '@typecad/passives/0603';
import { Schematic, PCB } from '@typecad/typecad';
import { ATtiny3227_M } from './ATtiny3227_M';
```
</ScrollArea>
This is importing the schematic and PCB classes from the `@typecad/typecad` package, and the ATtiny3227_M component from the `./ATtiny3227_M` file the tooling created. All packages import 0603-sized passives by default. This can be changed as we'll discuss later.

## `interface`
<ScrollArea orientation="both">

```ts
...
interface Itypecad_package {
    schematic?: Schematic,
    reference?: string,
    passives?: typeof _0603
    pcb?: PCB;
};
...
    constructor({ schematic, reference, passives, pcb }: Itypecad_package = {})
...
```
</ScrollArea>

This is the code needed to provide the optional parameters interface discussed in other parts of the documentation. It allows the end user to accept defaults or override them without needing to modify the behavior of the other parameters. 

In this example, when a `new` typecad_package is created and the `constructor` is called, a schematic, reference, passives, and pcb can be provided. If not provided, the default behavior will be used. If **type**CAD requires one of the parameters, it will throw an error indicating which one is required.

## `constructor`
<ScrollArea orientation="both">

```ts
export class typecad_package {
    #schematic: Schematic;
    #passives: typeof _0603;
    pcb: PCB;
    U1: ATtiny3227_M;

    constructor({ schematic, reference, passives, pcb }: Itypecad_package = {}) {
        if (schematic) {
            this.#schematic = schematic;
        } else {
            throw new Error('schematic: Schematic is a required typeCAD parameter');
        }
        this.#passives = passives || _0603;
        if (pcb) this.pcb = pcb;

        this.U1 = new ATtiny3227_M(reference);
    }
...
}
```
</ScrollArea>

The `constructor` is where all the initialization happens. It is what is called when a `new` instance is created. The existing code is mostly boilerplate; checking that `schematic` was passed, assigning the `passives` to the default if not provided, assigning the `pcb` if passed, and creating the `U1` component.

You'll see that the `U1` component is declared as a class property. This is important for allowing it to be changed outside the package. When you create this package in your implementation code, you can access it like this: `package.U1`. You can change any `U1` property this way, avoiding the need to edit this file directly to make changes. It is suggested that all components be created in this way.

If there were additional passives needed, pullup/pulldown resistors, capacitors, etc., they would be added here. 

## `add`
<ScrollArea orientation="both">

```ts
add() {
    // create connections here
    // avoid using ::named() in favor of simply using ::net()

    // add components to schematic
    this.#schematic.add(this.U1);
}
```
</ScrollArea>

`add` is called after any component modifications and all `net` connections have been made. It will add all of the components to the `Schematic` passed. 

As the comment suggests, avoid making connections using `::named()` and instead use `::net()`. The reason for this is that **type**CAD merges `net` connections that contain the same pins. This means that the user-created `::named()` connections will likely be overwritten by the package-created connections because they will occur earlier in the code/build order. 

## `place`
<ScrollArea orientation="both">

```ts
place(pcb?: PCB) {
    if (pcb) this.pcb = pcb;

    this.U1.pcb = { x: 149.339, y: 100.838, rotation: 0 };

    this.pcb.group('typecad_package', this.U1);
    this.pcb.create();
}
```
</ScrollArea>

`place` is used to place components on a PCB. For this to work, the `pcb` property must be set. Each component has a `pcb` object that takes `x`, `y`, and `rotation` properties. These coordinates come from KiCAD. The `group` method is used to group components together. This is useful for placing multiple components in the same group. You can avoid grouping them and simply place them by calling `::place()` instead.

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/package/use" class={buttonVariants({ variant: "outline" })}>Use<ChevronRight /></a>
    </p>
</div>