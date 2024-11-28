import { parseAutoLayoutFrame } from "./parsers/autolayout.ts";
import { parseComponentInstance } from "./parsers/componentInstance.ts";
import { parseText } from "./parsers/text.ts";
import variables from "./variables.json";
import componentData from "../lib/data.json";
import { parseIcon } from "./parsers/Icon.ts";
import { parseRectangle } from "./parsers/Rectangle.ts";
import { parseEllipse } from "./parsers/Ellipse.ts";
import { parseLine } from "./parsers/Line.ts";
import { parseFrame } from "./parsers/Frame.ts";
import { parseGroup } from "./parsers/Group.ts";


const { componentNames, iconNames } = componentData;

// Create a slug from a string
export function createSlug(str: string): string {
    return str
        .toLowerCase()
        .split(/\s+/)
        .map((word, index) => {
            return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join("");
}

// Create a unique id
export function getUniqueId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `id_${timestamp}_${randomPart}`;
}

// Convert time string to ISO 8601 format
export function convertTimeToISOFormat(time: string): string {
    const [timePart, period] = time.split(" ");
    let [hours, minutes, seconds = 0] = timePart.split(":").map(Number);

    if (period && period.toLowerCase() === "pm" && hours !== 12) {
        hours += 12;
    } else if (period && period.toLowerCase() === "am" && hours === 12) {
        hours = 0;
    }

    // Pad the numbers manually to avoid using padStart
    const padZero = (num: number): string => (num < 10 ? `0${num}` : `${num}`);
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

// Convert date string to ISO 8601 format
export function convertDateToISOFormat(date: string): string {
    const [month, day, year] = date.split("/").map(Number);
    // Pad the numbers manually to avoid using padStart
    const padZero = (num: number): string => (num < 10 ? `0${num}` : `${num}`);
    return `${year}-${padZero(month)}-${padZero(day)}`;
}

// Convert date and time string to ISO 8601 format
export function convertDateTimeToISOFormat(dateTime: string): string {
    const [datePart, ...timeParts] = dateTime.split(/,?\s+/);
    const time = timeParts.join(" ");
    const isoDate = convertDateToISOFormat(datePart);
    const isoTime = convertTimeToISOFormat(time);
    return `${isoDate}T${isoTime}`;
}

// Utility function to convert px to rem
export function pxToRem(px: number): string {
    const baseFontSize = 16; // Assuming the base font size is 16px
    return `${px / baseFontSize}rem`;
}

// Generates a unique class name for a given SceneNode.
export function genUniqueClassName(node: SceneNode): string {
    let layerName = node.name;

    if (layerName.length > 8) layerName = layerName.slice(0, 8);
    return `${layerName.replace(/[^a-zA-Z0-9-_]/g, "")}-${node.id.replace(/[^a-zA-Z0-9-_]/g, "")}`;
}

// Convert rgba to hex
export function rgba2hex(rgba: { r: number; g: number; b: number; a: number }): string {
    const toHex = (value: number) => {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    const r = toHex(rgba.r);
    const g = toHex(rgba.g);
    const b = toHex(rgba.b);
    const a = toHex(rgba.a);

    return `#${r}${g}${b}${a}`;
}

// Shallow clone an object
function clone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

// Parses the static fills of a node and returns the hex color
export function parseStaticFills(node: SceneNode): string {
    if (!("fills" in node) || (node.fills as Paint[]).length === 0) return "transparent";

    const solidFill = clone(node.fills).find((fill: Paint) => fill.type === "SOLID" && fill.visible !== false);

    if (!solidFill) return "transparent";

    let color = solidFill.color;
    color.a = solidFill.opacity;

    return rgba2hex(color);
}

// Parses the static stroke of a node and returns the hex color
export function parseStaticStroke(node: SceneNode): string {
    if (!("strokes" in node) || (node.strokes as Paint[]).length === 0) return "transparent";

    const solidStroke = clone(node.strokes).find((stroke: Paint) => stroke.type === "SOLID" && stroke.visible !== false);

    if (!solidStroke) return "transparent";

    let color = solidStroke.color;
    color.a = solidStroke.opacity;
    return rgba2hex(color);
}
// Retrieves the fill color variable name from the provided node.
export function getFillColorVariable(node: SceneNode, withVarPrefix: boolean = true): string {
    // Get fills if they exist on the node
    const fills = "fills" in node ? (node as GeometryMixin).fills : null;

    // Find the first visible, solid fill
    const solidFill = Array.isArray(fills) ? fills.find((fill) => fill.type === "SOLID" && fill.visible !== false) : null;

    // Get the color ID from the fill's bound variables
    const colorId = solidFill?.boundVariables?.color?.id;

    // Find the matching variable in our variables array
    const variable = variables.find((v) => v.id === colorId);

    // Construct the color variable string
    let colorVariable = "initial";
    if (variable) {
        colorVariable = withVarPrefix ? `var(${variable.varName})` : variable.varName;
    }

    return colorVariable;
}

// Retrieves the stroke color variable name from the provided node.
export function getStrokeColorVariable(node: SceneNode, withVarPrefix: boolean = true): string {
    // Get strokes if they exist on the node
    const strokes = "strokes" in node ? (node as GeometryMixin).strokes : null;

    // Find the first visible, solid stroke
    const solidStroke = Array.isArray(strokes)
        ? strokes.find((stroke) => stroke.type === "SOLID" && stroke.visible !== false)
        : null;

    // Get the color ID from the stroke's bound variables
    const colorId = solidStroke?.boundVariables?.color?.id;

    // Find the matching variable in our variables array
    const variable = variables.find((v) => v.id === colorId);

    // Construct the color variable string
    let colorVariable = "initial";
    if (variable) {
        colorVariable = withVarPrefix ? `var(${variable.varName})` : variable.varName;
    }

    return colorVariable;
}

// Create an Abstract Syntax Tree from the code string
function createAst(code: string): string[] {
    const stack: string[] = [];
    const regex = /<(\/?)([\w-]+)[^>]*>/g;
    let match;

    while ((match = regex.exec(code)) !== null) {
        const [, isClosing, tagName] = match;
        if (!isClosing) {
            stack.push(tagName);
        } else if (stack[stack.length - 1] === tagName) {
            stack.pop();
        }
    }

    return stack;
}

// Cleans the duplicate imports from the script
function cleanImports(script: string): string {
    const importLines: string[] = [];
    const otherLines: string[] = [];
    const importSet = new Set<string>();

    script.split("\n").forEach((line: string) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("import ")) {
            if (!importSet.has(trimmedLine)) {
                importSet.add(trimmedLine);
                importLines.push(trimmedLine);
            }
        } else {
            otherLines.push(line);
        }
    });

    // Group imports by their source
    const groupedImports: { [key: string]: string[] } = {};
    importLines.forEach((line) => {
        const match = line.match(/from\s+["'](.+)["']/);
        if (match) {
            const source = match[1];
            if (!groupedImports[source]) {
                groupedImports[source] = [];
            }
            groupedImports[source].push(line);
        }
    });
    // Combine imports from the same source
    const combinedImports = Object.entries(groupedImports).map(([source, imports]: [string, string[]]) => {
        if (imports.length === 1) {
            return imports[0];
        }
        const importedItems = imports
            .map((imp) => imp.match(/import\s+{(.+)}\s+from/)?.[1])
            .filter(Boolean)
            .join(", ");
        return `import { ${importedItems} } from "${source}";`;
    });

    return [...combinedImports, ...otherLines].join("\n");
}

export type ParsedCode = {
    script: string;
    code: string;
    style: string;
};

// Function to parse the figma nodes and generate Svelte code
export function parseFigmaNode(node: SceneNode): ParsedCode {
    let mainScript = "";
    let mainCode = "";
    let mainStyle = "";

    // Icon node
    if (node.type === "INSTANCE" && iconNames.includes(node.name)) {
        const { script, code, style } = parseIcon(node);
        mainScript += script;
        mainCode += code;
        mainStyle += style;
    }

    // Instance node of Deskblocks
    else if (node.type === "INSTANCE" && componentNames.includes(node.name)) {
        const { script, code, style } = parseComponentInstance(node);
        mainScript += script;
        mainCode += code;
        mainStyle += style;
    }

    // Autolayout node
    else if ("layoutMode" in node && node.layoutMode !== "NONE" && node.type !== "COMPONENT_SET") {
        const { script, code, style } = parseAutoLayoutFrame(node);
        mainScript += script;
        mainStyle += style;
        mainCode += code;
        if (node.children) {
            const childrenResults = node.children.map(parseFigmaNode);
            childrenResults.forEach((result) => {
                const { script, code, style } = result;
                mainScript += script;
                mainStyle += style;
                mainCode += code;
            });
        }

        const ast = createAst(mainCode);
        const lastOpeningTag = ast[ast.length - 1];
        mainCode += lastOpeningTag ? `</${lastOpeningTag}>` : "</div>";
    }
    // Frame node
    else if (node.type === "FRAME") {
        const { script, code, style } = parseFrame(node);
        mainScript += script;
        mainStyle += style;
        mainCode += code;
        if (node.children) {
            const childrenResults = node.children.map(parseFigmaNode);
            childrenResults.forEach((result) => {
                const { script, code, style } = result;
                mainScript += script;
                mainStyle += style;
                mainCode += code;
            });
        }

        const ast = createAst(mainCode);
        const lastOpeningTag = ast[ast.length - 1];
        mainCode += lastOpeningTag ? `</${lastOpeningTag}>` : "</div>";
    }

    // Group node
    else if (node.type === "GROUP") {
        const { script, code, style } = parseGroup(node);
        mainScript += script;
        mainStyle += style;
        mainCode += code;

        const xpos = node.x;
        const ypos = node.y;

        if (node.children) {
            const childrenResults = node.children.map(parseFigmaNode);
            childrenResults.forEach((result) => {
                const { script, code, style } = result;

                const className = parseUniqueClass(style);
                const parentPos = `.${className}{ --parentXpos: ${pxToRem(xpos)}; --parentYpos: ${pxToRem(ypos)};}`

                mainScript += script;
                mainStyle += parentPos + style;
                mainCode += code;
            });
        }

        const ast = createAst(mainCode);
        const lastOpeningTag = ast[ast.length - 1];
        mainCode += lastOpeningTag ? `</${lastOpeningTag}>` : "</div>";
    }

    // Text node
    else if (node.type === "TEXT") {
        const { script, code, style } = parseText(node);
        mainScript += script;
        mainCode += code;
        mainStyle += style;
    }

    // Rectangle node
    else if (node.type === "RECTANGLE") {
        const { script, code, style } = parseRectangle(node);
        mainScript += script;
        mainStyle += style;
        mainCode += code;
    }

    // Ellipse node
    else if (node.type === "ELLIPSE") {
        const { script, code, style } = parseEllipse(node);
        mainScript += script;
        mainStyle += style;
        mainCode += code;
    }

    // Line node
    else if (node.type === "LINE") {
        const { script, code, style } = parseLine(node);
        mainScript += script;
        mainStyle += style;
        mainCode += code;
    }

    const cleanedScript = cleanImports(mainScript);

    return { script: cleanedScript, code: mainCode, style: mainStyle };
}


function parseUniqueClass(css: string): string | null {
    const regex = /\.([a-zA-Z0-9_-]+) *\{/;
    const match = css.match(regex);
    return match ? match[1] : null;
}
