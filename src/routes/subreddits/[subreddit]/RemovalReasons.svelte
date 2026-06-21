<script lang="ts">
    import { fetchRemovalReasons } from "$lib/api/subreddits.remote";
    import TableChangesCell from "$lib/components/reuse/table/table-changes-cell.svelte";
    import * as Alert from "$lib/components/ui/alert";
    import { Button } from "$lib/components/ui/button";
    import PromiseButton from "$lib/components/ui/button/promise-button.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Select from "$lib/components/ui/select";
    import * as Table from "$lib/components/ui/table";
    import type { SidebarSubreddit } from "$lib/types/subreddit";
    import { CircleAlert, Plus, Trash, Undo, X } from "@lucide/svelte";
    import RemReasonModal from "./RemReasonModal.svelte";

    interface Props {
        subreddit: SidebarSubreddit;
        original: Record<string, string>;
        current: Record<string, string>;
    }

    let { subreddit, original, current = $bindable() }: Props = $props();

    const deleteItem = (key: string) => {
        delete current[key];
        console.log("deleted", key);
    };

    const undeleteItem = (key: string) => {
        current[key] = original[key];
    };

    let modalOpen = $state(false);

    const allKeys: Record<string, string> = $derived({
        ...original,
        ...current,
    });

    const query = $derived(fetchRemovalReasons(subreddit.id));

    const handleCreateReason = () => {
        return new Promise<void>((resolve, reject) => {
            const opened = window.open(
                `https://sh.reddit.com/mod/${subreddit.name}/saved-responses/removals`,
                "CreateRemovalReason"
            );

            if (opened) {
                let interval = setInterval(() => {
                    if (opened.closed) {
                        clearInterval(interval);

                        query.refresh().then(resolve).catch(reject);
                    }
                }, 1000);
            } else {
                reject();
            }
        });
    };

    const apiReasons = $derived(await query);
</script>

{#if modalOpen}
    <Dialog.Root bind:open={modalOpen}>
        <RemReasonModal
            onSubmit={(alias) => {
                current[alias] = apiReasons?.at(0)?.id ?? "set-id-here";
                modalOpen = false;
            }}
        />
    </Dialog.Root>
{/if}

{#if apiReasons.length === 0}
    <Alert.Root class="my-10">
        <CircleAlert />
        <Alert.Title>No removal reasons from Reddit</Alert.Title>
        <Alert.Description>
            Reddit has not returned any removal reasons to populate the options
            below.
        </Alert.Description>

        <Alert.Action>
            <PromiseButton onclick={handleCreateReason} size="sm">
                Create reason
            </PromiseButton>
        </Alert.Action>
    </Alert.Root>
{/if}

<Table.Root>
    <Table.Header>
        <Table.Row>
            <Table.Head class="w-10"></Table.Head>
            <Table.Head>Alias</Table.Head>
            <Table.Head>Reason UUID</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each Object.entries(allKeys) as [alias, reason_id]}
            {@const created = original[alias] === undefined}
            {@const updated = original[alias] !== current[alias]}
            {@const deleted = current[alias] === undefined}
            {@const fromApi = apiReasons.find((s) => s.id === reason_id)}

            <Table.Row class={[deleted && "line-through"]}>
                <TableChangesCell {deleted} {updated} {created} />
                <Table.Cell>
                    {alias}
                </Table.Cell>
                <Table.Cell>
                    <Select.Root
                        type="single"
                        bind:value={
                            () => reason_id, (newId) => (current[alias] = newId)
                        }
                    >
                        <Select.Trigger class="lg:min-w-md">
                            {#if fromApi}
                                {fromApi.title}
                            {:else}
                                <X />

                                {reason_id}
                            {/if}
                        </Select.Trigger>

                        <Select.Content>
                            <Select.Label>Reasons</Select.Label>

                            {#each apiReasons as reason (reason.id)}
                                <Select.Item
                                    value={reason.id}
                                    label={reason.title}
                                >
                                    {reason.title}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </Table.Cell>
                <Table.Cell class="flex justify-end  gap-2">
                    {#if deleted}
                        <Button
                            class="float-end"
                            variant="outline"
                            size="icon-sm"
                            onclick={() => undeleteItem(alias)}
                        >
                            <Undo />
                        </Button>
                    {:else}
                        <Button
                            class="float-end"
                            variant="destructive"
                            size="icon-sm"
                            onclick={() => deleteItem(alias)}
                        >
                            <Trash />
                        </Button>
                    {/if}
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
    <Table.Footer>
        <Table.Row>
            <Table.Cell colspan={4}>
                <Button
                    size="icon-sm"
                    class="float-end"
                    variant="outline"
                    onclick={() => (modalOpen = true)}
                >
                    <Plus />
                </Button>
            </Table.Cell>
        </Table.Row>
    </Table.Footer>
</Table.Root>
