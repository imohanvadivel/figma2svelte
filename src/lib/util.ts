// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function postFigma(msg: any) {
    parent.postMessage({ pluginMessage: msg }, "*");
}
