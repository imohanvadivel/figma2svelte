import { genUniqueClassName, pxToRem, rgba2hex, type ParsedCode } from "../util.ts";

export function parseGroup(node: GroupNode): ParsedCode {
    const uniqueClass = genUniqueClassName(node);

    const width = pxToRem(node.width);
    const height = pxToRem(node.height);

    const left = pxToRem(node.x);
    const top = pxToRem(node.y);

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

    const code = `<div class="group-node ${uniqueClass}">`;

    const style = `.${uniqueClass} {
      width: ${width};
      height: ${height};
      opacity: ${opacity};
      ${rotation ? `transform: rotate(${rotation}deg);` : ""}
      position: relative;
      --xpos: ${left};
      --ypos: ${top};
    }
    .${uniqueClass} > * {
      position: absolute !important;
      ${shadow && `box-shadow: ${shadow};`}
    }
    :global(.frame-node > .${uniqueClass}) {
      left: ${left};
      top: ${top};
    }
    :global(.group-node > .${uniqueClass}) {
      left: calc(${left} - var(--parentXpos)) !important;
      top: calc(${top} - var(--parentYpos)) !important;
    }`;

    return { script: "", code, style };
}
