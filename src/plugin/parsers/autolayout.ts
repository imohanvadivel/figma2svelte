import {
    createSlug,
    genUniqueClassName,
    getFillColorVariable,
    getStrokeColorVariable,
    parseStaticFills,
    parseStaticStroke,
    pxToRem,
    rgba2hex,
    type ParsedCode,
} from "../util.ts";

export function parseAutoLayoutFrame(node: FrameNode | ComponentNode | InstanceNode): ParsedCode {
    const uniqueClass = genUniqueClassName(node);

    // Check if the autolayout is a radio group
    let isRadioGroup = false;
    if (node.children.length > 0) {
        isRadioGroup = node.children.every((child) => child.type === "INSTANCE" && child.name === "Radio");
    }

    /*==== Style ====*/
    const getSize = (size: number | string, sizing: string) =>
        sizing === "FIXED" ? pxToRem(size as number) : sizing === "FILL" ? "100%" : "auto";

    const width = getSize(node.width, node.layoutSizingHorizontal);
    const height = getSize(node.height, node.layoutSizingVertical);

    const dimensions = {
        minWidth: node.minWidth ? pxToRem(node.minWidth) : null,
        maxWidth: node.maxWidth ? pxToRem(node.maxWidth) : null,
        minHeight: node.minHeight ? pxToRem(node.minHeight) : null,
        maxHeight: node.maxHeight ? pxToRem(node.maxHeight) : null,
    };
    const borderRadius = {
        topLeft: pxToRem(node.topLeftRadius),
        topRight: pxToRem(node.topRightRadius),
        bottomLeft: pxToRem(node.bottomLeftRadius),
        bottomRight: pxToRem(node.bottomRightRadius),
    };

    let backgroundColor = getFillColorVariable(node);
    if (backgroundColor === "initial") backgroundColor = parseStaticFills(node);

    let strokeColor = getStrokeColorVariable(node);
    if (strokeColor === "initial") strokeColor = parseStaticStroke(node);

    const borderWidth = ((): string => {
        if (node.strokes.length === 0) return "0";
        return `${node.strokeTopWeight}px ${node.strokeRightWeight}px ${node.strokeBottomWeight}px ${node.strokeLeftWeight}px`;
    })();
    const rotation = node.rotation;
    const opacity = node.opacity;
    const overflow = node.clipsContent ? "hidden" : "visible";

    const padding = {
        top: pxToRem(node.paddingTop || 0),
        right: pxToRem(node.paddingRight || 0),
        bottom: pxToRem(node.paddingBottom || 0),
        left: pxToRem(node.paddingLeft || 0),
    };

    const layout = {
        wrap: node.layoutWrap === "WRAP" ? "wrap" : "nowrap",
        itemSpacing: pxToRem(node.itemSpacing || 0),
        counterAxisSpacing: pxToRem(node.counterAxisSpacing || 0),
        mode: node.layoutMode === "HORIZONTAL" ? "row" : "column",
        counterAxisAlign:
            node.counterAxisAlignItems === "MIN" ? "flex-start" : node.counterAxisAlignItems === "MAX" ? "flex-end" : "center",
        primaryAxisAlign:
            node.primaryAxisAlignItems === "MIN" ? "flex-start" : node.primaryAxisAlignItems === "MAX" ? "flex-end" : "center",
        primaryAxisSizing: node.primaryAxisSizingMode === "FIXED" ? "fixed" : "auto",
        counterAxisSizing: node.counterAxisSizingMode === "FIXED" ? "fixed" : "auto",
    };

    const gap = (() => {
        if (layout.mode === "row") {
            return `${layout.counterAxisSpacing} ${layout.itemSpacing}`;
        } else {
            return `${layout.itemSpacing} ${layout.counterAxisSpacing}`;
        }
    })();

    const className = isRadioGroup ? `:global(.${uniqueClass})` : `.${uniqueClass}`;

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

    const style = `
    ${className} {
        width: ${width};
        height: ${height};
        background-color: ${backgroundColor};
        border-width: ${borderWidth};
        border-style: solid;
        border-color: ${strokeColor};
        padding: ${padding.top} ${padding.right} ${padding.bottom} ${padding.left};
        display: flex;
        flex-direction: ${layout.mode};
        flex-wrap: ${layout.wrap};
        align-items: ${layout.counterAxisAlign};
        justify-content: ${layout.primaryAxisAlign};
        border-radius: ${borderRadius.topLeft} ${borderRadius.topRight} ${borderRadius.bottomRight} ${borderRadius.bottomLeft};
        gap: ${gap};
        ${dimensions.minWidth ? `min-width: ${dimensions.minWidth};` : ""}
        ${dimensions.maxWidth ? `max-width: ${dimensions.maxWidth};` : ""}
        ${dimensions.minHeight ? `min-height: ${dimensions.minHeight};` : ""}
        ${dimensions.maxHeight ? `max-height: ${dimensions.maxHeight};` : ""}
        ${
            layout.mode === "row"
                ? `align-self: ${layout.counterAxisSizing === "fixed" ? "flex-start" : "stretch"};`
                : `justify-self: ${layout.counterAxisSizing === "fixed" ? "flex-start" : "stretch"};`
        }
        opacity: ${opacity};
        ${shadow && `box-shadow: ${shadow};`}
        ${rotation ? `transform: rotate(${rotation}deg);` : ""}
        overflow: ${overflow};
    }`;

    /*==== Script ====*/
    let script = "";

    const radioGroupId = `radio_${node.id.replace(/[^a-zA-Z0-9]/g, "")}`;

    if (isRadioGroup) {
        script = `import { RadioGroup } from "deskblocks";\n`;
        let checkedValue = "";
        if (node.children) {
            const checkedRadio = node.children.find(
                (child) => (child as InstanceNode).componentProperties.checked.value === "true"
            );
            if (checkedRadio) {
                const labelKey = Object.keys((checkedRadio as InstanceNode).componentProperties).find((key) =>
                    key.startsWith("label")
                );
                if (labelKey) {
                    const label = (checkedRadio as InstanceNode).componentProperties[labelKey].value as string;

                    checkedValue = createSlug(label);
                }
            }
        }

        script += `let ${radioGroupId}Value = '${checkedValue}';\n`;
    }

    /*==== Code ====*/

    const code = isRadioGroup
        ? `<RadioGroup class="${uniqueClass}" ${
              layout.mode === "row" ? "inline" : ""
          } bind:group={${radioGroupId}Value} name="${uniqueClass}">`
        : `<div class="${uniqueClass}">`;

    return { script, style, code };
}
