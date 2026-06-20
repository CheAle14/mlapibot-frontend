<script lang="ts">
    import {
        fetchStaffReplyThreads,
        refreshStaffReplyThread
    } from "$lib/api/staff_replies.remote";
    import { Anchor } from "$lib/components/reuse/anchor";
    import { PagedTable } from "$lib/components/reuse/paged-table";
    import { Button, PromiseButton } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { TableCell, TableHead, TableRow } from "$lib/components/ui/table";
    import type { PageReq } from "$lib/types/pagination";
    import type {
        StaffReplyThread
    } from "$lib/types/staff_replies";
    import { parseRedditLink } from "$lib/utils";
    import {
        ChevronDown,
        ChevronUp,
        Plus,
        RefreshCcw
    } from "@lucide/svelte";
    import { toast } from "svelte-sonner";
    import type { PageProps } from "./$types";
    import StaffRepliesTable from "./StaffRepliesTable.svelte";

    const { params, data }: PageProps = $props();

    let liveRefreshes = $state(0);

    let page = $state<PageReq>({
        page: 0,
        limit: 10,
    });

    let addNewThreadLink = $state('');

    const subreddit = $derived(data.subreddit.id);

    let expanded = $state<string | null>(null);
    let refetchTrigger = $state<number>(0);

    const threads = $derived(
        fetchStaffReplyThreads({
            subreddit,
            page,
        }),
    );

    const getLink = (post_id: string, comment_id?: string) => {
        let base = `https://reddit.com/r/${params.subreddit}/comments/${post_id}`;
        if (comment_id) {
            return base + "/-/" + comment_id;
        }
        return base;
    };

    const refreshStaffThread = (thread: StaffReplyThread) => {
        const makePromise = async () => {
            liveRefreshes++;
            try {
                const response =  await refreshStaffReplyThread({
                    ...thread,
                    subreddit,
                });

                if (response.new_staff_comments > 0 && expanded === thread.post_id) {
                    refetchTrigger++;
                }

                return response;
            } finally {
                liveRefreshes--;
            }
        };

        const innerPromise = makePromise();

        toast.promise(innerPromise, {
            loading: `Fetching any new or edited staff replies in ${thread.post_id}`,
            error: "Failed to fetch replies",
            success: (data) => {
                return `Saw ${data.total_comments} comments, ${data.total_staff_comments} by staff of which ${data.new_staff_comments} were new`;
            },
        });

        return innerPromise;
    };

    const addNewThread = async () => {
        const makePromise = async () => {
            liveRefreshes++;
            try {
                const link = parseRedditLink(addNewThreadLink);

                console.log(addNewThreadLink, '=>', link);

                if (!link) throw 'No or invalid link was provided';

                if (link.subreddit !== data.subreddit.name) throw 'Link subreddit does not match this one';

                if (!('post_id' in link) || !link.post_id) throw 'Must be a permalink to a post or any comment with in';

                if (threads.current && threads.current.data.some(s => s.post_id === link.post_id)) 
                    throw 'That thread already exists on this page. Just hit the refresh button next to it.'
                
                const response = await refreshStaffReplyThread({
                    post_id: link.post_id,
                    subreddit,
                });

                if (response.new_staff_comments > 0) {
                    threads.refresh();
                }

                addNewThreadLink = '';
                return response;
            } finally {
                liveRefreshes--;
            }
        };

        const innerPromise = makePromise();

        toast.promise(innerPromise, {
            loading: `Searching for replies in new post`,
            error: (err) => {
                if (typeof err === 'string')
                    return err;
                return 'Failed to add new post';
            },
            success: (data) => {
                return `Saw ${data.total_comments} comments, ${data.total_staff_comments} by staff of which ${data.new_staff_comments} were new`;
            },
        });

        return innerPromise;
    };

    const expandRow = (item: StaffReplyThread) => {
        if (expanded === item.post_id) {
            refetchTrigger = 0;
            expanded = null;
        } else {
            expanded = item.post_id;
        }
    };
</script>

<PagedTable query={threads} bind:page key={(i) => i.post_id}>
    {#snippet header()}
        <TableRow>
            <TableHead></TableHead>
            <TableHead>Post</TableHead>
            <TableHead>Stickied Comment</TableHead>
            <TableHead>Commented At</TableHead>
            <TableHead>Suffix</TableHead>
            <TableHead></TableHead>
        </TableRow>
    {/snippet}

    {#snippet row(item: StaffReplyThread)}
        <TableRow>
            <TableCell>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onclick={() => expandRow(item)}
                >
                    {#if expanded === item.post_id}
                        <ChevronUp />
                    {:else}
                        <ChevronDown />
                    {/if}
                </Button>
            </TableCell>
            <TableCell>
                <Anchor href={getLink(item.post_id)}>{item.post_id}</Anchor>
            </TableCell>
            <TableCell>
                <Anchor href={getLink(item.post_id, item.our_comment_id)}>
                    {item.our_comment_id}
                </Anchor>
            </TableCell>
            <TableCell>{item.created_at}</TableCell>
            <TableCell>{item.suffix ? "yes" : "no"}</TableCell>
            <TableCell>
                <PromiseButton
                    disabled={liveRefreshes >= 3}
                    size="icon-sm"
                    variant="ghost"
                    onclick={() => refreshStaffThread(item)}
                >
                    <RefreshCcw />
                </PromiseButton>
            </TableCell>
        </TableRow>

        {#if expanded === item.post_id}
            <TableRow>
                <TableCell colspan={"100%" as any} class="pl-5">
                    <StaffRepliesTable
                        subreddit={data.subreddit}
                        post_id={item.post_id}
                        {refetchTrigger}
                    />
                </TableCell>
            </TableRow>
        {/if}
    {/snippet}

    {#snippet footer()}
        <TableRow>
            <TableCell>
            </TableCell>

            <TableCell colspan={4}>
                <Input type="url" placeholder={`https://reddit.com/r/...`} bind:value={addNewThreadLink} />
            </TableCell>

            <TableCell>
                <PromiseButton
                    disabled={threads.loading || !addNewThreadLink || liveRefreshes >= 3} 
                    size="icon-sm" 
                    variant="outline"
                    onclick={addNewThread}
                >
                    <Plus />
                </PromiseButton>
            </TableCell>
        </TableRow>
    {/snippet}
</PagedTable>
