<script lang="ts">
    import { fetchStaffRepliesInThread } from "$lib/api/staff_replies.remote";
    import { Anchor } from "$lib/components/reuse/anchor";
    import { PagedTable } from "$lib/components/reuse/paged-table";
    import * as Item from "$lib/components/ui/item";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import { TableCell, TableHead, TableRow } from "$lib/components/ui/table";
    import type { PageReq } from "$lib/types/pagination";
    import type { StaffReply } from "$lib/types/staff_replies";
    import type { SidebarSubreddit } from "$lib/types/subreddit";
    import Markdown from "svelte-exmarkdown";

    interface Props {
        subreddit: SidebarSubreddit;
        post_id: string;
        refetchTrigger: number;
    }

    let { subreddit, post_id, refetchTrigger }: Props = $props();

    let page = $state<PageReq>({
        page: 0,
        limit: 100,
    });

    let query = $derived(
        fetchStaffRepliesInThread({
            subreddit: subreddit.id,
            post_id,
            page,
        }),
    );

    $effect(() => {
        if (refetchTrigger > 0)
            query.refresh();
    });
</script>

<Item.Root variant="outline" class="w-auto m-2">
    <Item.Content>
        <PagedTable {query} bind:page key={(i) => i.comment_id}>
            {#snippet header()}
                <TableRow>
                    <TableHead>Link</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                </TableRow>
            {/snippet}

            {#snippet skeletonRow()}
                <TableRow>
                    <TableCell>
                        <Skeleton class="h-4 w-15" />
                    </TableCell>
                    <TableCell>
                        <Skeleton class="h-4 w-30" />
                    </TableCell>
                    <TableCell>
                        <Skeleton class="h-4 w-100" />
                    </TableCell>
                </TableRow>
            {/snippet}

            {#snippet row(item: StaffReply)}
                <TableRow>
                    <TableCell>
                        <Anchor
                            href={`https://reddit.com/r/${subreddit.name}/comments/${post_id}/-/${item.comment_id}`}
                        >
                            {item.comment_id}
                        </Anchor>
                    </TableCell>
                    <TableCell>
                        <Anchor
                            href={`https://reddit.com/u/${item.author_name}`}
                        >
                            /u/{item.author_name}
                        </Anchor>
                    </TableCell>
                    <TableCell class="whitespace-normal">
                        <div class="overflow-y-scroll max-h-25">
                            <Markdown md={item.content} />
                        </div>
                    </TableCell>
                </TableRow>
            {/snippet}
        </PagedTable>
    </Item.Content>
</Item.Root>
