<script lang="ts">
    import { CircleAlert } from "@lucide/svelte";
    import { isHttpError } from "@sveltejs/kit";
    import AlertDescription from "../../ui/alert/alert-description.svelte";
    import AlertTitle from "../../ui/alert/alert-title.svelte";
    import Alert from "../../ui/alert/alert.svelte";

    interface Props {
        title: string;
        error: unknown;
    }

    let { title, error }: Props = $props();
</script>

<Alert variant="destructive">
    <CircleAlert />

    <AlertTitle>{title}</AlertTitle>

    <AlertDescription>
        {#if isHttpError(error)}
            {error.body.message}
        {:else}
            Unknown error occurred
        {/if}
    </AlertDescription>
</Alert>
