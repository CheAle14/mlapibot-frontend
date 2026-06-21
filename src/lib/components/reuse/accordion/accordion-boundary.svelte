<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import { Spinner } from "$lib/components/ui/spinner";
    import { ChevronDownIcon, X } from "@lucide/svelte";
    import { type Snippet } from "svelte";
    import AccordionPending from "./accordion-pending.svelte";

    interface Props {
        open: string[];
        value: string;
        arrow?: "left" | "right";
        errorTimeoutMs?: number;
        trigger: Snippet;
        triggerOutside?: Snippet;
        children?: Snippet;
    }

    let {
        open,
        value,
        arrow,
        errorTimeoutMs = 0,
        trigger,
        triggerOutside,
        children,
    }: Props = $props();

    let isOpen = $derived(open?.includes(value));
    let loading: "idle" | "loading" | "error" = $state("idle");

    const onerror = (err: unknown) => {
        console.error("accordion boundary error:", err);
        loading = "error";
        if (errorTimeoutMs > 0) {
            setTimeout(() => (loading = "idle"), errorTimeoutMs);
        }
    };
</script>

<Accordion.Item {value}>
    <Accordion.Trigger
        {arrow}
        doRotate={loading === "idle"}
        outside={triggerOutside}
    >
        {@render trigger()}

        {#snippet renderArrow()}
            {#if loading === "idle"}
                <ChevronDownIcon
                    class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
                />
            {:else if loading === "loading"}
                <Spinner />
            {:else}
                <X class="size-4" color="red" />
            {/if}
        {/snippet}
    </Accordion.Trigger>

    <Accordion.Content forceMount>
        {#if isOpen}
            <AccordionPending bind:loading {onerror}>
                {@render children?.()}
            </AccordionPending>
        {/if}
    </Accordion.Content>
</Accordion.Item>
