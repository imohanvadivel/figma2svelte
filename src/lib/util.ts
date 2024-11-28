// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function postFigma(msg: any) {
    parent.postMessage({ pluginMessage: msg }, "*");
}

export function regenerateCode() {
    postFigma({
        type: "REGENERATE_CODE",
    });
}

export function removeApiKey() {
    postFigma({
        type: "NOTIFY",
        message: "Removing API key",
        options: { timeout: 3000 },
    });
    postFigma({
        type: "REMOVE_API_KEY",
    });
}

export function validateApiKey(apiKey: string) {
    postFigma({
        type: "NOTIFY",
        message: "Validating API key",
        options: { timeout: 3000 },
    });
    postFigma({
        type: "VALIDATE_API_KEY",
        apiKey,
    });
}

export function updateApiKey(apiKey: string) {
    postFigma({
        type: "NOTIFY",
        message: "Updating API key",
        options: { timeout: 3000 },
    });
    postFigma({
        type: "UPDATE_API_KEY",
        apiKey,
    });
}
