<script lang="ts">
  import { DocsSidebarNav } from '$lib/components/nav/index.js';
  import TableOfContents from '$lib/components/table-of-contents.svelte';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { docsConfig } from '$lib/config/docs.js';
  import '../../markdown.css';
  let { children } = $props();
	import { page } from "$app/state";

</script>

<div class="">
  <div
    class="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
    <aside
      class="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
      <ScrollArea class="h-full py-6 pr-6 lg:py-8">
        <DocsSidebarNav items={docsConfig.docsNav} />
        <DocsSidebarNav items={docsConfig.packageNav} />
      </ScrollArea>
    </aside>
    <main
      class="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
      <div class="mx-auto w-full ">
        <div class="markdown pb-12 pt-8" id="markdown">
          {@render children?.()}
        </div>

      </div>
      <div class="hidden text-sm xl:block">
        <div
          class="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] overflow-hidden pt-6">
          {#key page.url.pathname}
            <TableOfContents />
          {/key}
        </div>
      </div>
    </main>
  </div>
</div>