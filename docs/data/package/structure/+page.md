<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Package Structure
Let's create a component package around the ATtiny3227 as an example. That is the default symbol in `@typecad/add-package` script. After running the script just hitting enter for defaults, you'll see this output:

<br />
<ScrollArea orientation="both">

```bash
Finished component creation, use it with:
 import { ATtiny3227_M } from './ATtiny3227_M';
 let u1 = new ATtiny3227_M();

Report any component creation issues: https://github.com/typecad/typecad/issues

Finished package creation, import it with:
 import { typecad_package } from "./typecad_package";

Report any creation issues: https://github.com/typecad/typecad/issues
```
</ScrollArea>

You'll see that it created a component file, `ATtiny3227M.ts` for us. It will contain all the code needed to create it and create named pins so we know what we're connecting. 

And more importantly, it created, a folder in `./src/` called `typecad_package` which will be the package we just created. 

## Package Contents
Inside the package folder, you'll see the following:
- `package.json` - the package.json file for the package. This is used by npm to manage the package.
- `ATtiny3227_M.ts` - the component file. This is the file that contains the code to create the component.
- `index.ts` - the main code for the package. This is where the majority of the code will be.
- `postinstall.js` - a script that runs after the package is installed in other projects. It will copy the symbol and footprint files from the package (which is located in ./node_modules), to the project's `./build` directory. This step is needed to allow KiCAD to find the files, and also to create a fully-modular and self-contained directory structure for the package.
- `./build` - this directory contains symbol, footprint, 3d models or any other files that are needed by the component for use in KiCAD.

### More about the `./build` directory
**type**CAD creates a KiCAD project that expects symbols and footprints to be in the `./build` directory. In the case of the ATtiny3227 component, it is already in the KiCAD library. If we picked a component that wasn't in the library, we would need to distrubute the symbol, footprint, and 3d models along with the package. This isn't limited to just those files though; the `postinstall.js` script can be modified to do anything that may be needed. Remember that when the package is installed using `npm i typecad_package`, all the files will be in the `./node_modules/typecad_package` directory, not the `./src` directory. 

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/package/code" class={buttonVariants({ variant: "outline" })}>Code<ChevronRight /></a>
    </p>
</div>