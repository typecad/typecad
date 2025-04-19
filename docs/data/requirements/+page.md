<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Requirements

Make sure your system has the required software to get started.
- [KiCAD](https://kicad.org/download/) - version **8.0** or later
- [npm/Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) - version **20** or later
- [Visual Studio Code](https://code.visualstudio.com/) - *not required, but highly recommended and used throughout this website*
- [PlatformIO](https://docs.platformio.org/en/latest/core/installation/index.html) - *mentioned, but not required*
- [git](https://git-scm.com/downloads) - *mentioned, but not required*

--- 

> [!WARNING] pio and git in your PATH
> Ensure that `pio` and `git` are in your PATH. **type**CAD optionally uses these commands in its tooling

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/concepts" class={buttonVariants({ variant: "outline" })}>Concepts <ChevronRight /></a>
    </p>
</div>