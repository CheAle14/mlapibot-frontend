<script lang="ts">
    import { fetchRedditSubmission } from "$lib/api/scams.remote";
    import { getVagueWords, setVagueWords } from "$lib/api/subreddits.remote";
    import { Badge } from "$lib/components/ui/badge";
    import { PromiseButton } from "$lib/components/ui/button";
    import {
        Field,
        FieldContent,
        FieldDescription,
        FieldGroup,
        FieldLabel,
        FieldLegend,
        FieldSet,
    } from "$lib/components/ui/field";
    import { Input } from "$lib/components/ui/input";
    import { type GotRedditPost } from "$lib/types/api";
    import type { SidebarSubreddit } from "$lib/types/subreddit";
    import { Search } from "@lucide/svelte";
    import { SvelteSet } from "svelte/reactivity";

    interface Props {
        subreddit: SidebarSubreddit;
    }

    const { subreddit }: Props = $props();

    let searchByUrl = $state<string>("");
    let searchedPost = $state<GotRedditPost | null>(null);

    let additional_text = $state<string | null>(null);
    const vague_words = $derived(await getVagueWords(subreddit.id));

    const adding_words = new SvelteSet<string>();
    const removing_words = new SvelteSet<string>();

    const total_words: string[] = $derived(
        adding_words.union(vague_words).values().toArray().sort(),
    );

    const hasChanges = $derived(
        adding_words.size > 0 || removing_words.size > 0,
    );

    const handleRemoveWord = (word: string) => {
        adding_words.delete(word);
        removing_words.delete(word);
    };

    const handleAdditionalText = () => {
        if (additional_text) {
            adding_words.clear();
            const normalized = additional_text
                .toLowerCase()
                .replaceAll(/[^a-z ]/g, "");

            for (const word of normalized.split(" ")) {
                if (word.trim().length === 0) continue;

                if (!vague_words.has(word)) {
                    adding_words.add(word);
                    removing_words.delete(word);
                }
            }
        }
    };

    const handleSearch = async () => {
        searchedPost = await fetchRedditSubmission(searchByUrl);
        additional_text = searchedPost.title;
        handleAdditionalText();
    };

    const handleSave = async () => {
        const all_words_added = vague_words.union(adding_words);
        const then_removed = all_words_added.difference(removing_words);

        await setVagueWords({
            subreddit: subreddit.id,
            words: then_removed,
        });
        adding_words.clear();
        removing_words.clear();
    };
</script>

<FieldGroup>
    <FieldSet>
        <FieldLegend>Vague words</FieldLegend>
        <FieldDescription>
            If all the words in a title are found on the list below it is
            considered vague. Any characters outside <kbd>a-z</kbd>
            are stripped.
        </FieldDescription>
        <FieldSet class="flex flex-col lg:flex-row">
            <Field>
                <FieldLabel>Fetch from post</FieldLabel>
                <FieldDescription>
                    Add vague words from post title
                </FieldDescription>

                <FieldContent class="flex flex-row">
                    <Input
                        type="url"
                        bind:value={searchByUrl}
                        placeholder={`https://reddit.com/r/${subreddit.name}/...`}
                    />

                    <PromiseButton
                        size="icon"
                        onclick={handleSearch}
                        disabled={searchByUrl.trim().length === 0}
                    >
                        <Search />
                    </PromiseButton>
                </FieldContent>
            </Field>
            <Field>
                <FieldLabel>Add words</FieldLabel>
                <FieldDescription>
                    Any new words in this text are added to the list of vague
                    words.
                </FieldDescription>

                <FieldContent>
                    <Input
                        type="text"
                        bind:value={additional_text}
                        onblur={handleAdditionalText}
                    />
                </FieldContent>
            </Field>
        </FieldSet>
    </FieldSet>

    <FieldSet class="flex flex-row flex-wrap gap-2">
        {#each total_words as word}
            {#if removing_words.has(word)}
                <Badge
                    class="line-through"
                    variant="destructive"
                    onclick={() => handleRemoveWord(word)}
                >
                    {word}
                </Badge>
            {:else if adding_words.has(word)}
                <Badge onclick={() => handleRemoveWord(word)}>
                    {word}
                </Badge>
            {:else}
                <Badge
                    variant="outline"
                    onclick={() => removing_words.add(word)}
                >
                    {word}
                </Badge>
            {/if}
        {/each}
    </FieldSet>

    <FieldSet>
        <PromiseButton disabled={!hasChanges} onclick={handleSave}>
            Save changes
        </PromiseButton>
    </FieldSet>
</FieldGroup>
