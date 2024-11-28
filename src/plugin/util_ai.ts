const BASE_URL = "https://figma.mohanvadivel.com";

function generateRandomId() {
    return Math.random().toString(36).substring(2, 15);
}

export async function validateApiKey(apiKey: string) {
    const URL = `${BASE_URL}/validateAnthropicApi?id=${generateRandomId()}`;

    const payload = { apiKey };

    try {
        const response = await fetch(URL, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.status === "error") {
            return false;
        }

        console.log("validateApiKey", data);

        return data;
    } catch (error) {
        console.error("validateApiKey error:", error);
        if (error instanceof TypeError && error.message.includes("fetch")) {
            console.error("Network error: No internet connection");
            figma.notify("No internet connection. Please check your network and try again.", { error: true });
        } else {
            figma.notify("An error occurred while validating the API key. Please try again.", { error: true });
        }
        return false;
    }
}

export async function refactorCode(apiKey: string, code: string) {
    const URL = `${BASE_URL}/refactorSvelte?id=${generateRandomId()}`;

    const payload = { apiKey, code };
    try {
        const response = await fetch(URL, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log("refactored code", data);

        if (data.status === "error") {
            figma.notify(data.error.message);
            return false;
        }

        return data.code[0].text;
    } catch (error) {
        console.error("Network error:", error);
        figma.notify("No internet connection. Please check your network and try again.", { error: true });
        return false;
    }
}
