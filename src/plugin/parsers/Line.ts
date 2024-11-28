import { genUniqueClassName, getStrokeColorVariable, parseStaticFills, parseStaticStroke, pxToRem, rgba2hex, type ParsedCode } from "../util.ts";

export function parseLine(node: LineNode): ParsedCode {
    const uniqueClass = genUniqueClassName(node);

    const width = pxToRem(node.width);
    const height = pxToRem(node.strokeWeight as number);

    const left = pxToRem(node.x);
    const top = pxToRem(node.y);

    let backgroundColor = getStrokeColorVariable(node);
    if (backgroundColor === "initial") backgroundColor = parseStaticStroke(node);

    const rotation = node.rotation;
    const opacity = node.opacity;
    const shadow = ((): string => {
        if (node.effects.length === 0) return "";
        let boxShadow: string = "";
        let shadows = node.effects.filter((effect) => effect.type === "DROP_SHADOW");

        shadows.forEach((shadow) => {
            const blur = shadow.radius;
            const spread = shadow.spread;
            const offsetX = shadow.offset.x;
            const offsetY = shadow.offset.y;
            const color = rgba2hex(shadow.color);
            boxShadow += `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}; `;
        });

        return boxShadow;
    })();

    const code = `<div class="${uniqueClass}"></div>`;
    const style = `.${uniqueClass} {
        width: ${width};
        height: ${height};
        background-color: ${backgroundColor};
        left: ${left};
        top: ${top};
        opacity: ${opacity};
        ${shadow && `box-shadow: ${shadow};`}
        ${rotation ? `transform: rotate(${rotation}deg);` : ""}
    }
    :global(.group-node > .${uniqueClass}) {
      left: calc(${left} - var(--parentXpos)) !important;
      top: calc(${top} - var(--parentYpos)) !important;
    }`;

    return { script: "", code, style };
}
