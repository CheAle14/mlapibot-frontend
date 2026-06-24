<script lang="ts">
    import {
        getSubredditModerators,
        refreshSubredditModerators,
    } from "$lib/api/subreddits.remote";
    import { AlertError } from "$lib/components/reuse/alert";
    import { PromiseButton } from "$lib/components/ui/button";
    import * as Item from "$lib/components/ui/item";
    import { Spinner } from "$lib/components/ui/spinner";
    import { ChevronRight } from "@lucide/svelte";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

    const query = $derived(getSubredditModerators(data.subreddit.id));

    const refresh = async () => {
        await refreshSubredditModerators(data.subreddit.id);
        await query.refresh();
    };
</script>

{#await query}
    <Spinner />
{:then moderators}
    <div class="flex flex-col gap-6 items-center">
        <h3 class="text-xl">Moderators</h3>

        <div class="flex flex-col gap-4">
            {#each moderators as moderator}
                <Item.Root variant="outline" class="w-xs xl:w-md">
                    <Item.Content>
                        <Item.Title>
                            <a href={`https://reddit.com/user/${moderator}`}>
                                {moderator}
                            </a>
                        </Item.Title>
                    </Item.Content>
                </Item.Root>
            {/each}

            <Item.Root variant="outline" class="w-xs xl:w-md">
                <Item.Content>
                    <Item.Title>Refresh</Item.Title>

                    <Item.Description>
                        Fetch list of moderators from Reddit
                    </Item.Description>
                </Item.Content>

                <Item.Actions>
                    <PromiseButton
                        variant="ghost"
                        size="icon-lg"
                        onclick={refresh}
                    >
                        <ChevronRight class="size-4" />
                    </PromiseButton>
                </Item.Actions>
            </Item.Root>
        </div>
    </div>
{:catch error}
    <AlertError title="Failed to fetch moderators" {error} />
{/await}
