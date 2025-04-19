<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Concepts

Instead of using the KiCAD schematic editor, you write code and then build it into a KiCAD schematic.

**type**CAD uses TypeScript. You don't need an extensive knowledge of TypeScript to get started. 

If you're familiar with any programming language, you can pick up the basics of TypeScript pretty quickly. 

<br>

> [!faq]- Why TypeScript?
> One of the long-term goals of **type**CAD was to integrate hardware design into the realm of AI. Most AI-based tools understand TypeScript very well and don't need special training to use it effectively.
> TypeScript is also relatively simple to learn and use. 

## KiCAD
The normal flow in KiCAD is:
1. Create a project and schematic
2. Add components
3. Make connections
4. Layout the board

## **type**CAD
**type**CAD replaces steps 1-3. Instead of clicking and dragging to place components and make connections, TypeScript code is used. 

This is how a schematic is created.

<ScrollArea orientation="both">

```ts 
import { Schematic } from '@typecad/typecad';
let typecad = new Schematic('typecad');
typecad.create();
```
</ScrollArea>

That code will create a KiCAD netlist named `typecad.net` which you can then import into a KiCAD PCB file. No schematic file is created because it's not needed.

### Build
**type**CAD projects have a build process. It takes the TypeScript code and turns it into a KiCAD project. The code you write, plus the **type**CAD API simply runs itself and the result is the KiCAD project. 

### Workflow
The new layout becomes:
1. Create a **type**CAD project
2. Edit the code to add components and make connections
3. Build it
4. Import the KiCAD netlist into KiCAD to layout the board


<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/tooling" class={buttonVariants({ variant: "outline" })}>Tooling<ChevronRight /></a>
    </p>
</div>