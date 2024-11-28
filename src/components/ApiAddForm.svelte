<script lang="ts">
    import { Confetti } from "svelte-confetti";
    import { Button, Label, Icon } from "figblocks";
    import { IconSpinner, IconClose } from "figblocks/icons";
    import Passcode from "./Passcode.svelte";
    import AnthropicLogo from "$lib/asset/anthropic.svg";
    import VerifiedLogo from "$lib/asset/verified.svg";
    import { postFigma, validateApiKey } from "$lib/util.ts";
    import { onMount } from "svelte";

    let apiKey = "";
    let isValidating = false;
    let isApiKeySet = false;
    let isDismissed = false;

    function handleSubmit() {
        if (!apiKey) {
            postFigma({ type: "NOTIFY", error: "Please enter your API key" });
            return;
        }
        isValidating = true;
        validateApiKey(apiKey);
    }

    onMount(() => {
        window.addEventListener("message", ({ data }) => {
            const { type } = data.pluginMessage;
            if (type === "API_KEY_VALIDATED") {
                isApiKeySet = true;
                isValidating = false;
            } else if (type === "API_KEY_INVALID") {
                isApiKeySet = false;
                isValidating = false;
            }
        });
    });

    $: formState = isValidating ? "validating" : isApiKeySet ? "set" : "input";
</script>

{#if !isDismissed}
    <section class="container">
        {#if formState === "validating"}
            <div class="loading-container">
                <Icon spin iconSvg={IconSpinner} color="--figma-color-icon-brand" />
                <p>Validating API key</p>
            </div>
        {:else if formState === "input"}
            <div class="api-key-section">
                <div class="logo">
                    {@html AnthropicLogo}
                </div>
                <h3>
                    Now generate production ready code powered by AI
                    <span class="font-secondary">(Claude 3.5 Haiku)</span>
                </h3>
                <div>
                    <Label>Anthropic API Key</Label>
                    <Passcode borders bind:value={apiKey} class="api-key" />
                </div>
                <footer>
                    <Button on:click={handleSubmit} variant="secondary">Get Started</Button>
                </footer>
            </div>
        {:else}
            <div class="api-key-set">
                <button class="close-button" on:click={() => (isDismissed = true)}>
                    <Icon iconSvg={IconClose} />
                </button>

                <div class="confetti-container">
                    <Confetti />
                </div>

                <div class="logo">
                    {@html VerifiedLogo}
                </div>

                <div class="success-message">
                    <p class="title">All Set!</p>
                    <p class="subtitle">Now the code generation will make use of Claude 3.5 Haiku</p>
                </div>
            </div>
        {/if}
    </section>
{/if}

<style>
    .confetti-container {
        position: absolute;
        top: 0;
        left: 50%;
        width: 100%;
        height: 100%;
        z-index: -1;
    }

    .close-button {
        position: absolute;
        top: 2px;
        right: 4px;
        background: none;
        border: none;
        cursor: pointer;
    }

    .container {
        display: flex;
        flex-direction: column;
        padding: 16px 16px 16px 16px;
        background-color: var(--figma-color-bg-secondary);
        border-radius: 8px;
        bottom: 0;
        position: sticky;
        margin: 16px;
        height: 196px;
    }

    .api-key-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .api-key-set,
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 12px;
    }

    .logo {
        margin-bottom: 4px;
    }

    h3 {
        font-size: 12px;
        font-weight: 500;
        color: var(--figma-color-text);
    }

    .font-secondary {
        color: var(--figma-color-text-secondary);
    }

    .success-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .success-message .title {
        font-size: 14px;
        font-weight: 500;
        color: var(--figma-color-text);
    }

    .success-message .subtitle {
        font-size: 12px;
        color: var(--figma-color-text-secondary);
    }
</style>
