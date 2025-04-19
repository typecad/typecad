<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Classes

## `Schematic`

The main class that represents the entire circuit.

<ScrollArea orientation="both">

```ts
import { Schematic } from '@typecad/typecad';
let typecad = new Schematic('typecad_concepts');
```
</ScrollArea>
The only option is the name. The name determines the name of the resulting KiCAD files.


## `Component`

The `Component` class represents individual parts like resistors, capacitors, ICs, etc. You add a `Component` to your `Schematic`.

<ScrollArea orientation="both">

```ts
import { Component } from '@typecad/typecad';

let R1 = new Component({ value: '1kohm' });
```
</ScrollArea>
Options for the `Component` class are:

- _reference_ — reference designator
- _value_ — value of component
- _footprint_ — footprint
- _prefix_ — prefix for reference designator
- _datasheet_ — link to component datasheet
- _description_ — description of component
- _voltage_ — voltage rating of component
- _wattage_ — wattage rating of component
- _mpn_ — Manufacturer Part Number
- _dnp_ — true if component is Do Not Populate, false to place component
- _simulation_ — an object with simulation data `{ include: true, model: 'ngspice-model' }`


<br >

> [!note] Syntax
> **type**CAD makes use of the above syntax style for many of its classes, ie. passing an object of optional properties. *Optional* in terms of TypeScript code, if a particular property isn't passed and **type**CAD requires it, it will throw an error during build. 

## `PCB`

Creates a KiCAD `.kicad_pcb` PCB file. Components can be added to the PCB, placed and oriented with code. 

<ScrollArea orientation="both">

```ts
import { PCB } from '@typecad/typecad';

let pcb = new PCB('typecad');
```
</ScrollArea>
The only option is the name. The name determines the name of the resulting KiCAD .kicad_pcb file.


## `Power`

Represents a power source like a battery or voltage regulator. 

<ScrollArea orientation="both">

```ts
import { Power } from '@typecad/typecad';

let coin_cell = new Power({ power: holder.pin(1), gnd: holder.pin(2), voltage: 3.7 });
```
</ScrollArea>
Options are:

- _power_ — pin on a component that supplies power
- _gnd_ — pin on a component that supplies ground
- _voltage_ — voltage of power source

<br />

> [!WARNING]
> `Power` represents a physical component that supplies power, that's why it takes `Pin` objects as a parameter. This is often a battery holder or voltage regulator. It is not the equivalent of a VCC symbol or GND symbol in a schematic. 

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/passives" class={buttonVariants({ variant: "outline" })}>Passives<ChevronRight /></a>
    </p>
</div>