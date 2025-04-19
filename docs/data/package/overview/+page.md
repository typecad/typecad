<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Packages
The first thing to know is **type**CAD works in the [npm/Node.js](https://www.npmjs.com/) ecosystem. Node.js is the engine that runs our code. It allows JavaScript and TypeScript to run on a computer like a normal program. npm is a package manager that comes along with Node.js.

### npm
npm, Node Package Manager, is a command-line tool for managing Java/Type Script packages in a project. It let's you install/update/remove/publish/wrap code. It's also an online repository for finding, downloading and hosting packages. 

You can do things like:

<ScrollArea orientation="both">

```bash
npm install ... # install a package
npm outdated    # check your project for outdated packages
npm update      # update all outdated packages
npm publish     # publish a package
```
</ScrollArea>

## **type**CAD packages
So what is **type**CAD package and what can be done with them?


### Modularity
> allows you to create hardware in a modular way

Let's say you use a particular MCU in a lot of designs. It requires the same power, ground, passives, etc. each time it's used. You could create a **type**CAD package of the implementation of that MCU once and then just `import` it next time.

<ScrollArea orientation="both">

```ts
import { MCU } from '@your-package'

let u1 = new MCU();
```
</ScrollArea>

`u1` is now a fully functional MCU with all the boilerplate power connections, passives, and whatever else was needed to bootstrap it.

### `git`
> allows you to version control

Using the above MCU example, let's say something was wrong with the MCU package. You could receive an issue in GitHub, accept PRs, publish new versions, and then just `npm update` to get the latest version in all your other projects. 

Or that MCU releases a new version. You can branch the repo, make changes and then publish a new version. All tracked, all easily understood using the same tools for software development.

You can track verified working designs and know 100% that block of code works, and clearly label alpha/beta/dev versions. 

### Custom tools
> create your own tools

Hardware design can be complicated. The ability to write your own tools that can hook directly into the codebase is a huge advantage. With programmatic access to all the components, pins, nets and everything else, complicated board analysis can be done. 

You could write a script that takes the finished KiCAD PCB, generates a BOM, runs DRC, checks if the repo is dirty, and packages any files needed to send to your fab.

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/package/tooling" class={buttonVariants({ variant: "outline" })}>Tooling<ChevronRight /></a>
    </p>
</div>