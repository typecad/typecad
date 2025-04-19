<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# Tooling

**type**CAD provides a collection of tools to make the development process easier.

## Project Creation
To create a new project enter the following command in your terminal:

<ScrollArea orientation="both">

```bash
npx @typecad/create-typecad
```
</ScrollArea>

The first time, `npx` will ask you to download the script so it can run it. 

Then you'll be prompted to enter project details:
- name for the project
- if you want to create a PlatformIO project and if so, the [board ID](https://docs.platformio.org/en/latest/boards/index.html)
- if you want to create a `git` repository
- install optional utility packages

A project will be created in the current directory. Inside the project directory, there will be a VSCode `workspace` file that will open the project in VSCode.

--- 

## Project Use
A **type**CAD project is just an npm package. All the normal npm-based tools are available to you. A `package.json` file is created with access to the following scripts:
- Project Building
- Adding Components
- Opening the `kicad_pcb` file in KiCAD

<br>

> [!tip]
> In VSCode, there's a sidebar that allows you to just click the various scripts to run them

### Project Building
Click the `Build` script in VSCode's `NPM Scripts` sidebar. 

To build the project in a terminal, run the following command:

<ScrollArea orientation="both">

```bash
npx tsx [path/to/file.ts]
```
</ScrollArea>

The output will be a KiCAD netlist file in `./build/`.


## Adding Components
Components are discussed in the [Components](/docs/components) page. But for now, they are anything with a footprint that you'd add to your schematic like MCUs and resistors.

To add a component to the project:
<ScrollArea orientation="both">

```bash
npx @typecad/add-component ./src
```
</ScrollArea>

When the script runs, you'll be asked if the component is a KiCAD library component, a component from a local file, or an EasyEDA/JLCPCB component.
- If it's a KiCAD library component, you'll be prompted to enter the symbol and footprint names
- If it's a local file, you'll be prompted to enter the path to the file
- If it's an EasyEDA/JLCPCB component, you'll be asked for the `C###` number


A `[component].ts` file will be generated along with instructions on how to use it. Files will also be copied into the `./build/` directory.

<br>

> [!important]
> There's no need to add passives (resistors, capacitors etc.) this way. See the  [Passives](/docs/passives) page for more information.

## Package Creation
typeCAD has a command-line tool to generate all the boilerplate code for a package. It sets up the package for easy publishing and reuse. It is discussed in more detail in the [Package Overview](/docs/package/overview) page.

Execute the following command in `./hw` of an already existing **type**CAD project.
<ScrollArea orientation="both">

```bash
npx @typecad/add-package ./src
```
</ScrollArea>

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/project-structure" class={buttonVariants({ variant: "outline" })}>Project Structure<ChevronRight /></a>
    </p>
</div>