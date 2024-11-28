import { parseFigmaNode } from "./util.ts";
import { refactorCode, validateApiKey } from "./util_ai.ts";
import { formatCode } from "./util_format.ts";
figma.showUI(__html__, { themeColors: true, width: 500, height: 560 });

let firstRun = true;

async function getApiKey() {
    const apiKey = await figma.clientStorage.getAsync("apiKey");
    if (!apiKey) {
        return false;
    }
    return apiKey;
}

async function setApiKey(apiKey: string) {
    console.log("setApiKey", apiKey);
    const res = await figma.clientStorage.setAsync("apiKey", apiKey);

    return res;
}

async function removeApiKey() {
    const res = await figma.clientStorage.deleteAsync("apiKey");
    return res;
}

async function parseFrame() {
    const selection = figma.currentPage.selection;
    const apiKey = await getApiKey();

    if (selection.length === 0) {
        if (!firstRun) figma.notify("No frame selected!");
        figma.ui.postMessage({
            type: "NO_SELECTION",
            apiKeySet: apiKey ? true : false,
            pluginApiKey: apiKey || null,
        });
        return;
    }

    figma.ui.postMessage({
        type: "GENERATING_CODE",
    });

    const { script, code, style } = parseFigmaNode(selection[0]);
    let svelteCode = formatCode(`<script lang="ts">${script}</script> ${code} <style>${style}</style>`);

    if (!apiKey) {
        figma.ui.postMessage({
            type: "CODE_GENERATED",
            apiKeySet: false,
            code: svelteCode,
        });
    } else {
        let refactoredCode = await refactorCode(apiKey, svelteCode);

        if (!refactoredCode) {
            figma.ui.postMessage({
                type: "CODE_GENERATED",
                apiKeySet: true,
                code: svelteCode,
                pluginApiKey: apiKey,
            });
        }

        figma.ui.postMessage({
            type: "CODE_GENERATED",
            apiKeySet: true,
            code: refactoredCode,
            pluginApiKey: apiKey,
        });
    }
}

parseFrame();

figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
        case "NOTIFY":
            figma.notify(msg.message, msg.options || {});
            break;

        case "REGENERATE_CODE":
            firstRun = false;
            parseFrame();
            break;

        case "VALIDATE_API_KEY":
            const res = await validateApiKey(msg.apiKey);

            if (res) {
                await setApiKey(msg.apiKey);
                figma.notify("API key Added");
                figma.ui.postMessage({
                    type: "API_KEY_VALIDATED",
                    apiKeySet: true,
                    pluginApiKey: msg.apiKey,
                });
                parseFrame();
            } else {
                figma.ui.postMessage({
                    type: "API_KEY_INVALID",
                    apiKeySet: false,
                    pluginApiKey: null,
                });
                figma.notify("Invalid API key", { error: true });
            }
            break;

        case "UPDATE_API_KEY":
            let updateRes = await validateApiKey(msg.apiKey);
            if (updateRes) {
                await setApiKey(msg.apiKey);
                figma.notify("API key updated");
                figma.ui.postMessage({
                    type: "API_KEY_UPDATED",
                    apiKeySet: true,
                    pluginApiKey: msg.apiKey,
                });
            } else {
                figma.notify("Invalid API key", { error: true });
                let apikey = await getApiKey();
                figma.ui.postMessage({
                    type: "API_KEY_INVALID",
                    apiKeySet: true,
                    pluginApiKey: apikey,
                });
            }
            break;

        case "REMOVE_API_KEY":
            await removeApiKey();
            figma.notify("API key removed");
            figma.ui.postMessage({
                type: "API_KEY_REMOVED",
                apiKeySet: false,
                pluginApiKey: null,
            });
            break;
    }
};
