import {
    genUniqueClassName,
    getFillColorVariable,
    getStrokeColorVariable,
    parseStaticFills,
    parseStaticStroke,
    pxToRem,
    rgba2hex,
    type ParsedCode,
} from "../util.ts";

export function parseEllipse(node: EllipseNode): ParsedCode {
    const uniqueClass = genUniqueClassName(node);

    const width = pxToRem(node.width);
    const height = pxToRem(node.height);

    const left = pxToRem(node.x);
    const top = pxToRem(node.y);

    let backgroundColor = getFillColorVariable(node);
    if (backgroundColor === "initial") backgroundColor = parseStaticFills(node);

    let strokeColor = getStrokeColorVariable(node);
    if (strokeColor === "initial") strokeColor = parseStaticStroke(node);

    const borderWidth = pxToRem(node.strokeWeight as number);

    const borderRadius = "50%";
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
        background-color: ${backgroundColor};
        border-width: ${borderWidth};
        border-style: solid;
        border-color: ${strokeColor};
        border-radius: ${borderRadius};
        width: ${width};
        height: ${height};
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
