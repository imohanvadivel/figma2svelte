<script lang="ts">
    import { onMount } from "svelte";
    import Prism from "prismjs";
    import "$lib/prism-theme-dark.css";
    import "$lib/prism-theme-light.css";
    import "prism-svelte";
    import { Button, Icon } from "figblocks";
    import { IconSpinner } from "figblocks/icons";
    import { postFigma, regenerateCode } from "$lib/util.ts";
    import EditorHeader from "./EditorHeader.svelte";

    export let code: string;
    export let isApiKeySet: boolean;
    export let apiKey: string | null;
    export let isLoading: boolean;
    let codeElement: HTMLElement;

    $: console.log("Editor Loading", isLoading);

    $: if (!code) isLoading = true;

    $: console.log("Editor code", code);

    onMount(() => {
        highlightCode();
    });

    function highlightCode() {
        if (codeElement) {
            codeElement.textContent = code;
            Prism.highlightElement(codeElement);
        }
    }

    $: if (codeElement && code) {
        highlightCode();
    }

    async function copyCode() {
        try {
            const tempInput = document.createElement("input");
            tempInput.value = code;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            postFigma({
                type: "NOTIFY",
                message: "Code copied to clipboard",
            });
        } catch (err) {
            console.log("Error copying code", err);

            postFigma({
                type: "NOTIFY",
                message: "Failed to copy code",
                options: { error: true },
            });
        }
    }
</script>

<section>
    {#if isLoading}
        <div class="loading-container">
            <Icon spin iconSvg={IconSpinner} color="--figma-color-icon-brand" />
            <p>Generating code...</p>
        </div>
    {:else}
        <EditorHeader {isApiKeySet} {apiKey} />
        <pre aria-label="Code editor" role="region"><code bind:this={codeElement} class="language-svelte"></code></pre>

        <footer>
            <Button on:click={copyCode}>Copy Code</Button>
            <Button variant="secondary" on:click={regenerateCode}>Regenerate Code</Button>
        </footer>
    {/if}
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    pre {
        overflow-x: auto;
        padding: 1rem;
        flex-grow: 1;
        margin: 0 !important;
    }
    code {
        font-family: "SF Mono", "Jetbrains Mono", monospace;
        line-height: 1.5;
    }

    footer {
        display: flex;
        padding: 1rem;
        border-top: 1px solid var(--figma-color-border);
        gap: 1rem;
        position: sticky;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        height: 100%;
        color: var(--figma-color-text);
    }
</style>
