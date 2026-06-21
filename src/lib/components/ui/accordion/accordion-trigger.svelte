<script lang="ts">
    import { cn, type WithoutChild } from "$lib/utils.js";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import { Accordion as AccordionPrimitive } from "bits-ui";
    import type { Snippet } from "svelte";

    type ArrowSide = 'left' | 'right';

    let {
        ref = $bindable(null),
        class: className,
        level = 3,
        arrow = 'right',
        doRotate = true,
        outside,
        renderArrow,
        children,
        ...restProps
    }: WithoutChild<AccordionPrimitive.TriggerProps> & {
        level?: AccordionPrimitive.HeaderProps["level"];
        outside?: Snippet;
        renderArrow?: Snippet;
        arrow?: ArrowSide;
        doRotate?: boolean;
    } = $props();

</script>

{#snippet defaultArrow()}
    <ChevronDownIcon
            class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
    />
{/snippet}

<AccordionPrimitive.Header {level} class="flex">
    {#if outside}
        <div
            class="items-start justify-between gap-4 rounded-md py-4 mr-4 text-start text-sm font-medium"
        >
            {@render outside()}
        </div>
    {/if}

    <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        bind:ref
        class={cn(
            "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start gap-4 rounded-md py-4 text-start text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
            arrow === 'right' && 'justify-between',
            doRotate && '[&[data-state=open]>svg]:rotate-180',
            className,
        )}
        {...restProps}
    >
    {#if arrow === 'left'}
        {@render (renderArrow ?? defaultArrow)()}
    {/if}
        
    {@render children?.()}
        
    {#if arrow === 'right'}
        {@render (renderArrow ?? defaultArrow)()}
    {/if}
    </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
