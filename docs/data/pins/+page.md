<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Pins
In **type**CAD, the `Pin` object represents the pin/leg/lead/ball etc. of a component. 

## `Pin`
All `Component` objects have a `::pin()` function that returns a `Pin` object for the number passed.

<ScrollArea orientation="both">

```ts
import { Resistor } from '@typecad/passives/0805'
let r1 = new Resistor({ value: '1kohm' });

r1.pin(1);      // to get the pin object for the first pin
r1.pin(2);      // and the second
```
</ScrollArea>

Using `::pin()` like that is the simplest way, but for more complex components, it can become unwieldy remembering which pin is which.

A more declarative way to use/create `Pin` objects is described in the [components](/docs/components) page. Using the **type**CAD tooling, any given component can be created giving access to `Pin` objects that allow them to be used with a descriptive name.

<ScrollArea orientation="both">

```ts
import { ATtiny85_20S } from './ATtiny85_20S';
let u1 = new ATtiny85_20S();

u1.VCC      // for this particular component, the VCC pin is pin 8
u1.GND      // GND is pin 4
```
</ScrollArea>

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/connections" class={buttonVariants({ variant: "outline" })}>Connections<ChevronRight /></a>
    </p>
</div>