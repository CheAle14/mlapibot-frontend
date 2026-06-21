<script lang="ts">
    interface Props {
        logkey?: string;
        onmount?: () => void;
        onunmount?: () => void;
    }

    let { logkey, onmount, onunmount }: Props = $props();

    $effect(() => {
        if (onmount) {
            onmount();
        }

        return onunmount
            ? () => {
                  onunmount();
              }
            : undefined;
    });
</script>
