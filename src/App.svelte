<script lang="ts">
    import { Button, Divider, Label } from "figblocks";
    import Passcode from "./components/Passcode.svelte";
    import CodeEditor from "./components/CodeEditor.svelte";
    import { onMount } from "svelte";
    import { postFigma, regenerateCode } from "$lib/util.ts";
    import ApiAddForm from "./components/ApiAddForm.svelte";

    let svelteCode = "";

    let isApiKeySet = false;
    let noSelection = true;
    let apiKey: string | null = null;
    let isLoading = false;

    $: console.log("App isLoading", isLoading);

    onMount(() => {
        window.onmessage = (event) => {
            const { type, code, apiKeySet, pluginApiKey } = event.data.pluginMessage;

            console.log("event", event.data.pluginMessage);

            switch (type) {
                case "NO_SELECTION":
                    noSelection = true;
                    isApiKeySet = apiKeySet;
                    apiKey = pluginApiKey;
                    break;
                case "GENERATING_CODE":
                    console.log("GENERATING_CODE");
                    noSelection = false;
                    isLoading = true;
                    break;
                case "CODE_GENERATED":
                    noSelection = false;
                    svelteCode = code;
                    isApiKeySet = apiKeySet;
                    isLoading = false;
                    apiKey = pluginApiKey;
                    break;
                case "API_KEY_VALIDATED":
                    noSelection = false;
                    isApiKeySet = apiKeySet;
                    apiKey = pluginApiKey;
                    break;
                case "API_KEY_REMOVED":
                    isApiKeySet = false;
                    apiKey = "";
                    break;
            }
        };
    });
</script>

{#if noSelection}
    <div class="no-selection-container">
        <div class="frame-selection">
            <div class="frame-selection-text">
                <p>No frame selected</p>
                <p class="font-secondary">Select a frame to generate code</p>
            </div>
            <Button on:click={regenerateCode}>Generate Code</Button>
        </div>

        {#if !isApiKeySet}
            <ApiAddForm />
        {/if}
    </div>
{:else}
    <CodeEditor code={svelteCode} {isApiKeySet} {apiKey} {isLoading} />
{/if}

<style>
    .frame-selection {
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: center;
        height: 60vh;
        justify-content: center;
    }

    .frame-selection-text {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
        color: var(--figma-color-text);
    }

    .no-selection-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        gap: 24px;
        position: relative;
        justify-content: space-between;
    }

    .font-secondary {
        /* font-size: 13px; */
        color: var(--figma-color-text-secondary);
    }
</style>
