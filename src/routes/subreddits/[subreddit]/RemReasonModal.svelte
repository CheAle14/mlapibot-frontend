<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Field from "$lib/components/ui/field";
    import { Input } from "$lib/components/ui/input";

    interface Props {
        onSubmit(alias: string): void;
    }

    let { onSubmit }: Props = $props();

    let value = $state('');
</script>

<Dialog.Content>
    <Dialog.Header>
        Create Alias
    </Dialog.Header>
    <Field.Group>
        <Field.Set>
            <Field.Group>
                <Field.Field>
                    <Field.Label>Alias</Field.Label>

                    <Input
                        type="text"
                        bind:value
                    />
                </Field.Field>
            </Field.Group>
        </Field.Set>
    </Field.Group>
    <Dialog.Footer>
        <Button type="submit" onclick={() => onSubmit(value)}
            >Save changes</Button
        >
    </Dialog.Footer>
</Dialog.Content>
