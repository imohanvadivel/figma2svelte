<script lang="ts">
    import { Button, Label, Icon } from "figblocks";
    import { IconClose } from "figblocks/icons";
    import Passcode from "./Passcode.svelte";
    import SuccessIcon from "../lib/asset/success.svg";
    import ErrorIcon from "../lib/asset/error.svg";
    import { removeApiKey, updateApiKey, validateApiKey } from "$lib/util.ts";
    export let apiKey: string | null;
    export let isApiKeySet: boolean;

    let isAddApiKeyFormVisible = false;
    let isApiUpdateFormVisible = false;
    $: console.log({ isApiKeySet, isAddApiKeyFormVisible, isApiUpdateFormVisible });

    $: console.log("header", apiKey);

    addEventListener("message", ({ data }) => {
        const { type } = data.pluginMessage;
        switch (type) {
            case "API_KEY_UPDATED":
                isApiUpdateFormVisible = false;
                break;
            case "API_KEY_REMOVED":
                isApiUpdateFormVisible = false;
                break;
            case "API_KEY_VALIDATED":
                isAddApiKeyFormVisible = false;
        }
    });
</script>

<header>
    {#if isApiKeySet}
        <div class="info-container success">
            <div class="left-part">
                {@html SuccessIcon}
                <div>
                    <span class="font-bold">AI Code Generation</span>
                    <span class="font-secondary">(powered by Claude 3.5 Haiku)</span>
                </div>
            </div>
            {#if isApiUpdateFormVisible}
                <button class="close-button" on:click={() => (isApiUpdateFormVisible = false)}>
                    <Icon iconSvg={IconClose} />
                </button>
            {:else}
                <Button class="btn" variant="tertiary" on:click={() => (isApiUpdateFormVisible = true)}>Edit API Key</Button>
            {/if}
        </div>
    {:else}
        <div class="info-container error">
            <div class="left-part">
                {@html ErrorIcon}
                <div>
                    <span class="font-bold">AI Code Generation</span>
                    <span class="font-secondary">(powered by Claude 3.5 Haiku)</span>
                </div>
            </div>
            {#if isAddApiKeyFormVisible}
                <button class="close-button" on:click={() => (isAddApiKeyFormVisible = false)}>
                    <Icon iconSvg={IconClose} />
                </button>
            {:else}
                <Button class="btn" variant="tertiary" on:click={() => (isAddApiKeyFormVisible = true)}>Add API Key</Button>
            {/if}
        </div>
    {/if}

    {#if isAddApiKeyFormVisible}
        <div class="api-add-form">
            <Label>Anthropic API Key</Label>
            <Passcode borders bind:value={apiKey} class="api-key" />
            <footer>
                <Button on:click={() => validateApiKey(apiKey)}>Get Started</Button>
            </footer>
        </div>
    {/if}

    {#if isApiUpdateFormVisible}
        <div class="api-update-form">
            <Label>Anthropic API Key</Label>
            <Passcode borders bind:value={apiKey} class="api-key" />
            <footer>
                <Button variant="secondary" on:click={() => updateApiKey(apiKey)}>Update API Key</Button>
                <Button variant="tertiary" destructive on:click={removeApiKey}>Remove API Key</Button>
            </footer>
        </div>
    {/if}
</header>

<style>
    .api-add-form,
    .api-update-form {
        padding: 0rem 1rem 1rem 1rem;
    }
    .api-add-form footer,
    .api-update-form footer {
        padding-top: 1rem;
        padding-left: 0.5rem;
        display: flex;
        gap: 1rem;
    }

    header {
        display: flex;
        justify-content: left;
        flex-direction: column;
        padding: 1.5rem;
        color: var(--figma-color-text);
        font-size: 12px;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--figma-color-border);
        justify-content: space-between;
    }

    header :global(.btn) {
        cursor: auto;
    }

    header .info-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: space-between;
    }

    .font-bold {
        font-weight: 600;
    }

    .font-secondary {
        color: var(--figma-color-text-secondary);
    }

    .left-part {
        display: flex;
        gap: 0.5rem;
    }

    .close-button {
        background: none;
        border: none;
        cursor: pointer;
    }
</style>
