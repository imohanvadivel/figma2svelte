import { getFillColorVariable, getStrokeColorVariable, type ParsedCode } from "../util.ts";

export function parseIcon(node: InstanceNode): ParsedCode {
    const iconName = `Icon${node.name}`;
    const width = node.width;

    const backgroundColor = getFillColorVariable(node.children[0], false);
    const strokeColor = getStrokeColorVariable(node.children[0], false);

    let iconColor: string;

    if (strokeColor !== "initial") {
        iconColor = strokeColor;
    } else if (backgroundColor !== "initial") {
        iconColor = backgroundColor;
    } else {
        iconColor = "--db-color-icon";
    }

    const script = `import { Icon } from "deskblocks";\n import { ${iconName} } from "deskblocks/icons";\n`;
    const code = `<Icon icon={${iconName}} size={${Number(width) + 8}} color="${iconColor}"></Icon>`;
    const style = ``;

    return { script, code, style };
}
