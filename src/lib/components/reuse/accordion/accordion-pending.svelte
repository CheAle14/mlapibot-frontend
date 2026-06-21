<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import { Button } from "$lib/components/ui/button";
    import * as Empty from "$lib/components/ui/empty";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import { RotateCcw } from "@lucide/svelte";
    import type { WithChildren } from "bits-ui";
    import { Callbacks } from "../callbacks";

    interface Props extends WithChildren {
        loading: "idle" | "loading" | "error";
        onerror: (error: unknown, reset: () => void) => void;
    }

    let { loading = $bindable(), onerror, children }: Props = $props();
</script>

<svelte:boundary {onerror}>
    {@render children?.()}

    {#snippet pending()}
        <Callbacks
            onmount={() => (loading = "loading")}
            onunmount={() => (loading = "idle")}
        />

        <div class="flex flex-col gap-4">
            <Skeleton class="w-3/4 h-5" />
            <Skeleton class="w-3/4 h-5" />
            <Skeleton class="w-3/4 h-5" />
        </div>
    {/snippet}

    {#snippet failed(error, reset)}
        <Accordion.Content>
            <Empty.Root>
                <Empty.Header>
                    <Empty.Media variant="icon">
                        <Button
                            size="icon-lg"
                            variant="outline"
                            onclick={reset}
                        >
                            <RotateCcw />
                        </Button>
                    </Empty.Media>

                    <Empty.Title>Error</Empty.Title>

                    <Empty.Description
                        >An unexpected error has occurred loading this content</Empty.Description
                    >
                </Empty.Header>
            </Empty.Root>
        </Accordion.Content>
    {/snippet}
</svelte:boundary>
