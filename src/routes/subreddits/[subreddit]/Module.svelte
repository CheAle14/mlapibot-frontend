<script lang="ts" generics="T extends keyof ApiSubredditModules">
    import { AccordionBoundary } from "$lib/components/reuse/accordion";
    import { Label } from "$lib/components/ui/label";
    import { Switch } from "$lib/components/ui/switch";
    import type {
        ApiSubredditModules,
        ApiSubredditOptions,
    } from "$lib/types/subreddit";
    import type { Snippet } from "svelte";

    interface SnippetArgs<T extends keyof ApiSubredditModules> {
        current: ApiSubredditOptions[T];
        original: ApiSubredditOptions[T];
    }

    interface ModuleProps<T extends keyof ApiSubredditModules> {
        key: T;
        title: string;
        description?: string;
        open: string[];

        children?: Snippet<[SnippetArgs<T>]>;

        original: ApiSubredditOptions;
        current: ApiSubredditOptions;
    }

    let {
        key,
        title,
        open,
        children,
        original,
        current = $bindable(),
    }: ModuleProps<T> = $props();

    let moriginal = $derived(original[key]);
    let mcurrent = $derived(current[key]);
</script>

{#snippet triggerOutside()}
    <Switch
        id={key}
        checked={mcurrent.enabled}
        onclick={(e) => {
            mcurrent.enabled = !mcurrent.enabled;
            e.preventDefault();
            e.stopPropagation();
            return false;
        }}
    />
{/snippet}

<AccordionBoundary {open} value={key} {triggerOutside} arrow="left">
    {#snippet trigger()}
        <Label>{title}</Label>
    {/snippet}

    {#if children}
        {@render children({
            current: mcurrent,
            original: moriginal,
        })}
    {:else}
        There are no options for this module.
    {/if}
</AccordionBoundary>
