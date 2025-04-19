<script lang="ts">
    import SvelteSeo from 'svelte-seo';
	const title: string = '📗 Docs | typeCAD.net';
	const url: string = 'https://typecad.net/packages';
	const description: string = 'typeCAD Packages';
	const image = '';
	const images = '';

    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { buttonVariants } from "$lib/components/ui/button";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    let { data }: { data: PageData } = $props();
</script>

# 📗 **type**CAD Documentation

These pages show **type**CAD in a user-focused way, without getting into the details of class properties and methods and less-used options.

The Docs section focuses on learning the basics. You'll probably want to start there. After that, have a look at the Packages section to learn how to fully use **type**CAD.

<div class="relative">
<br/>
<br/>
<br/>
    <p class="absolute right-0">
       <a href="/docs/requirements" class={buttonVariants({ variant: "outline" })}>Requirements <ChevronRight /></a>
    </p>
</div>

<SvelteSeo
{title}
{description}
canonical={url}
jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: title,
		description: description,
		url: url,
		image: image,
	}}
openGraph={{
		title,
		description,
		url,
		type: 'website',
		site_name: 'typeCAD.net',
		// images
	}}
/>
