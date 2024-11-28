import {
    genUniqueClassName,
    pxToRem,
    getFillColorVariable,
    type ParsedCode,
    parseStaticFills,
    rgba2hex,
    getStrokeColorVariable,
    parseStaticStroke,
} from "../util.ts";

export function parseText(node: TextNode): ParsedCode {
    const uniqueClass = genUniqueClassName(node);

    const code = `<p class="${uniqueClass}">${node.characters}</p>`;

    const getFontSize = (fontSize: number | typeof figma.mixed): number => {
        if (typeof fontSize === "symbol") {
            fontSize = node.getRangeFontSize(0, 1);
        }
        return fontSize as number;
    };

    const getFontWeight = (fontWeight: number | typeof figma.mixed): string => {
        if (typeof fontWeight === "symbol") {
            fontWeight = node.getRangeFontWeight(0, 1);
        }
        return fontWeight.toString();
    };

    const getLineHeight = (lineHeight: LineHeight | PluginAPI["mixed"]): string | number => {
        if (typeof lineHeight === "symbol") {
            lineHeight = node.getRangeLineHeight(0, 1);
            if (typeof lineHeight === "symbol") return "normal";
        }
        if (lineHeight.unit === "AUTO") return "normal";
        if (lineHeight.unit === "PERCENT") return lineHeight.value / 100;
        if (lineHeight.unit === "PIXELS") return lineHeight.value / Number(fontSize);
        return "normal";
    };

    const getLetterSpacing = (letterSpacing: LetterSpacing | PluginAPI["mixed"]): number | string => {
        if (typeof letterSpacing === "symbol") {
            letterSpacing = node.getRangeLetterSpacing(0, 1);
            if (typeof letterSpacing === "symbol") return 0;
        }
        if (letterSpacing.unit === "PIXELS") return letterSpacing.value / Number(fontSize);
        if (letterSpacing.unit === "PERCENT") return `${letterSpacing.value / 100}`;
        return 0;
    };

    let backgroundColor = getFillColorVariable(node);
    if (backgroundColor === "initial") backgroundColor = parseStaticFills(node);

    const fontSize = getFontSize(node.fontSize);
    const fontWeight = getFontWeight(node.fontWeight);
    const lineHeight = getLineHeight(node.lineHeight);
    const letterSpacing = getLetterSpacing(node.letterSpacing);
    const rotation = node.rotation;
    const opacity = node.opacity;
    const left = pxToRem(node.x);
    const top = pxToRem(node.y);
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

    const style = `.${uniqueClass} {
        font-size: ${pxToRem(fontSize)};
        font-weight: ${fontWeight};
        text-align: ${node.textAlignHorizontal.toLowerCase()};
        line-height: ${lineHeight};
        letter-spacing: ${letterSpacing};
        color: ${backgroundColor};
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
