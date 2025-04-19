<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Connections
In **type**CAD, connections are created by calling the `Schematric::net()` function. Connections are made between components in the same `Schematic`. 

The `net()` function takes a list of `Pin` objects. 

## Connecting Pins
Let's add a decoupling capacitor to the ATtiny85 example we've been working with.
<ScrollArea orientation="both">

```ts
import { Capacitor } from '@typecad/passives/0805'// [!code highlight]
import { ATtiny85_20S } from './ATtiny85_20S';
import { Schematic } from '@typecad/typecad';

let typecad = new Schematic('typecad_docs');
let u1 = new ATtiny85_20S();
let c1 = new Capacitor({ value: '1uF' });// [!code highlight]

typecad.net(u1.VCC, c1.pin(1));     // power [!code highlight]
typecad.net(u1.GND, c1.pin(2));     // ground [!code highlight]
```
</ScrollArea>

We've connected pin 1 of the capacitor to the VCC pin of the ATtiny85 and pin 2 to the GND pin.

`::net()` takes any number of `Pin` objects, so you can connect multiple pins at once.

### Named Connections
Sometimes it is useful to name the connection. The net name will be visible in KiCAD, it can be useful when laying out the board. Some **type**CAD utility functions will only pay attention to named connections as well. If you don't name the connection, it will be `net#`.


<ScrollArea orientation="both">

```ts
typecad.net(u1.VCC, c1.pin(1)); // [!code --]
typecad.named('power').net(u1.VCC, c1.pin(1)); // [!code ++]
```
</ScrollArea>

The connection in KiCAD will now be labled `power`.

<br />

> [!WARNING]
> **type**CAD merges nets with similar `Pin` connections. If you make a connection to an already connected pin, that newer net will be merged into the existing net. This will mean your `named` net may not keep the name you give it if it is merged with another net later. You'll see a warning in the build output if this happens. 

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/board_layout" class={buttonVariants({ variant: "outline" })}>Board Layout<ChevronRight /></a>
    </p>
</div>