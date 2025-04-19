<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Project Structure

A **type**CAD project is self-contained and looks like this:

```bash
project
├── fw
├── hw
│    └── build
│        └── lib
│            └── footprints
└── src
```

## `fw`
Intended for firmware. If a PlatformIO project is created when you run `npx @typecad/create-typecad`, you can open the `workspace` file to open both the firmware and hardware projects in the same VSCode and have access to their respective build tools.

## `hw`
All the hardware-related files are here.
- `build` holds all the KiCAD files
- `./build/lib` is where KiCAD symbols are stored
- `./build/footprints` is where KiCAD footprints are stored
- `src` is where the TypeScript files are stored

## Self-contained
The entire project is contained in the project folder. Symbols, footprints, 3d files, source files, etc. are all in this project folder.

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/classes" class={buttonVariants({ variant: "outline" })}>Classes<ChevronRight /></a>
    </p>
</div>