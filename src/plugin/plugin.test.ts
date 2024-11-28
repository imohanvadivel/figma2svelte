import { describe, it, expect } from "vitest";
import {
    convertTimeToISOFormat,
    convertDateToISOFormat,
    convertDateTimeToISOFormat,
    getUniqueId,
    createSlug,
    rgba2hex,
    parseStaticFills,
    parseStaticStroke,
    getFillColorVariable,
    getStrokeColorVariable,
} from "./util.ts";

/*============= ISO conversion functions =============*/
describe("ISO conversion functions", () => {
    describe("convertTimeToISOFormat", () => {
        it("should convert AM time correctly", () => {
            expect(convertTimeToISOFormat("09:30:00 AM")).toBe("09:30:00");
        });

        it("should add seconds if missing", () => {
            expect(convertTimeToISOFormat("10:15 AM")).toBe("10:15:00");
            expect(convertTimeToISOFormat("03:45 PM")).toBe("15:45:00");
        });

        it("should convert PM time correctly", () => {
            expect(convertTimeToISOFormat("02:45:30 PM")).toBe("14:45:30");
        });

        it("should handle midnight correctly", () => {
            expect(convertTimeToISOFormat("12:00:00 AM")).toBe("00:00:00");
        });

        it("should handle noon correctly", () => {
            expect(convertTimeToISOFormat("12:00:00 PM")).toBe("12:00:00");
        });
    });

    describe("convertDateToISOFormat", () => {
        it("should convert date correctly", () => {
            expect(convertDateToISOFormat("12/31/2023")).toBe("2023-12-31");
        });

        it("should handle single-digit month and day", () => {
            expect(convertDateToISOFormat("1/1/2023")).toBe("2023-01-01");
        });
    });

    describe("convertDateTimeToISOFormat", () => {
        it("should convert date and time correctly", () => {
            expect(convertDateTimeToISOFormat("12/31/2023 11:59 PM")).toBe("2023-12-31T23:59:00");
        });

        it("should handle AM time", () => {
            expect(convertDateTimeToISOFormat("1/1/2023 12:00:00 AM")).toBe("2023-01-01T00:00:00");
        });
    });
});

/*============= getUniqueId =============*/
describe("getUniqueId", () => {
    it("should return a string", () => {
        expect(typeof getUniqueId()).toBe("string");
    });

    it("should return a unique value each time", () => {
        const id1 = getUniqueId();
        const id2 = getUniqueId();
        expect(id1).not.toBe(id2);
    });

    it('should start with "id_"', () => {
        expect(getUniqueId().startsWith("id_")).toBe(true);
    });

    it("should have the correct format", () => {
        const idRegex = /^id_[a-z0-9]+_[a-z0-9]{5}$/;
        expect(idRegex.test(getUniqueId())).toBe(true);
    });
});

/*============= createSlug =============*/
describe("createSlug", () => {
    it("should convert a simple string correctly", () => {
        expect(createSlug("Hello World")).toBe("helloWorld");
    });

    it("should handle uppercase words", () => {
        expect(createSlug("THIS IS A TEST")).toBe("thisIsATest");
    });

    it("should remove spaces", () => {
        expect(createSlug("multiple   spaces")).toBe("multipleSpaces");
    });

    it("should handle mixed case", () => {
        expect(createSlug("MixEd CaSe StRiNg")).toBe("mixedCaseString");
    });

    it("should handle empty string", () => {
        expect(createSlug("")).toBe("");
    });

    it("should handle single word", () => {
        expect(createSlug("Word")).toBe("word");
    });
});

/*============= rgba2hex =============*/
describe("rgba2hex", () => {
    it("should convert rgba to hex correctly", () => {
        expect(rgba2hex({ r: 1, g: 0, b: 0, a: 1 })).toBe("#ff0000ff");
        expect(rgba2hex({ r: 0, g: 1, b: 0, a: 1 })).toBe("#00ff00ff");
        expect(rgba2hex({ r: 0, g: 0, b: 1, a: 1 })).toBe("#0000ffff");
    });

    it("should handle partial opacity", () => {
        expect(rgba2hex({ r: 1, g: 1, b: 1, a: 0.5 })).toBe("#ffffff80");
    });

    it("should handle zero values", () => {
        expect(rgba2hex({ r: 0, g: 0, b: 0, a: 0 })).toBe("#00000000");
    });

    it("should handle decimal values", () => {
        expect(rgba2hex({ r: 0.5, g: 0.25, b: 0.75, a: 1 })).toBe("#8040bfff");
    });

    it("should return an 8-character string", () => {
        const result = rgba2hex({ r: 0.1, g: 0.2, b: 0.3, a: 0.4 });
        expect(result).toHaveLength(9);
        expect(result[0]).toBe("#");
    });
});

/*============= Parse Static Colors =============*/

describe("Parse Static Colors", () => {
    // parseStaticFills
    describe("parseStaticFills", () => {
        it("should return 'transparent' for node without fills", () => {
            const node = { type: "RECTANGLE" };
            expect(parseStaticFills(node as SceneNode)).toBe("transparent");
        });

        it("should parse solid fill correctly", () => {
            const node = {
                fills: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0.8509804010391235, g: 0.8509804010391235, b: 0.8509804010391235 },
                    },
                ],
            };
            expect(parseStaticFills(node as unknown as SceneNode)).toBe("#d9d9d9ff");
        });

        it("should handle multiple fills and return the first visible solid fill", () => {
            const node = {
                fills: [
                    { type: "GRADIENT", visible: true },
                    { type: "SOLID", visible: false, color: { r: 1, g: 0, b: 0 } },
                    { type: "SOLID", visible: true, opacity: 0.5, color: { r: 0, g: 1, b: 0 } },
                    { type: "SOLID", visible: true, opacity: 1, color: { r: 0, g: 0, b: 1 } },
                ],
            };
            expect(parseStaticFills(node as unknown as SceneNode)).toBe("#00ff0080");
        });

        it("should return 'transparent' if no visible solid fills", () => {
            const node = {
                fills: [
                    { type: "GRADIENT", visible: true },
                    { type: "SOLID", visible: false, color: { r: 1, g: 0, b: 0 } },
                ],
            };
            expect(parseStaticFills(node as unknown as SceneNode)).toBe("transparent");
        });

        it("should handle fill opacity", () => {
            const node = {
                fills: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 0.5,
                        color: { r: 1, g: 1, b: 1 },
                    },
                ],
            };
            expect(parseStaticFills(node as unknown as SceneNode)).toBe("#ffffff80");
        });
    });

    // parseStaticStroke
    describe("parseStaticStroke", () => {
        it("should return 'transparent' for node without strokes", () => {
            const node = { type: "RECTANGLE" };
            expect(parseStaticStroke(node as SceneNode)).toBe("transparent");
        });

        it("should parse solid stroke correctly", () => {
            const node = {
                strokes: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0.8509804010391235, g: 0.8509804010391235, b: 0.8509804010391235 },
                    },
                ],
            };
            expect(parseStaticStroke(node as unknown as SceneNode)).toBe("#d9d9d9ff");
        });

        it("should handle multiple strokes and return the first visible solid stroke", () => {
            const node = {
                strokes: [
                    { type: "GRADIENT", visible: true },
                    { type: "SOLID", visible: false, color: { r: 1, g: 0, b: 0 } },
                    { type: "SOLID", visible: true, opacity: 0.5, color: { r: 0, g: 1, b: 0 } },
                    { type: "SOLID", visible: true, opacity: 1, color: { r: 0, g: 0, b: 1 } },
                ],
            };
            expect(parseStaticStroke(node as unknown as SceneNode)).toBe("#00ff0080");
        });

        it("should return 'transparent' if no visible solid strokes", () => {
            const node = {
                strokes: [
                    { type: "GRADIENT", visible: true },
                    { type: "SOLID", visible: false, color: { r: 1, g: 0, b: 0 } },
                ],
            };
            expect(parseStaticStroke(node as unknown as SceneNode)).toBe("transparent");
        });

        it("should handle stroke opacity", () => {
            const node = {
                strokes: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 0.5,
                        color: { r: 1, g: 1, b: 1 },
                    },
                ],
            };
            expect(parseStaticStroke(node as unknown as SceneNode)).toBe("#ffffff80");
        });
    });
});

/*============= Parse Color Variables =============*/
describe("Parse Color Variables", () => {
    // Get Fill Variable
    describe("Get Fill Variable", () => {
        it("should return the CSS custom variable if present in variables.json", () => {
            const node = {
                fills: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0.5, g: 0.25, b: 0.75, a: 1 },
                        boundVariables: {
                            color: {
                                id: "VariableID:61:36",
                            },
                        },
                    },
                ],
            };
            expect(getFillColorVariable(node as unknown as SceneNode)).toBe("var(--db-color-bg-brand)");
        });

        it("should return 'initial' if the color is not found in variables.json", () => {
            const node = {
                fills: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0.1, g: 0.2, b: 0.3, a: 1 },
                        boundVariables: {
                            color: {
                                id: "non-existent-id",
                            },
                        },
                    },
                ],
            };
            expect(getFillColorVariable(node as unknown as SceneNode)).toBe("initial");
        });

        it("should return the CSS custom variable without var(...) prefix when withVarPrefix is false", () => {
            const node = {
                fills: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0.5, g: 0.25, b: 0.75, a: 1 },
                        boundVariables: {
                            color: {
                                id: "VariableID:61:36",
                            },
                        },
                    },
                ],
            };
            expect(getFillColorVariable(node as unknown as SceneNode, false)).toBe("--db-color-bg-brand");
        });

        it("should return 'initial' if no fills", () => {
            const node = { fills: [] };
            expect(getFillColorVariable(node as unknown as SceneNode)).toBe("initial");
        });

        it("should return the first visible solid fill's CSS variable", () => {
            const node = {
                fills: [
                    { type: "GRADIENT", visible: true },
                    { type: "SOLID", visible: false, color: { r: 1, g: 0, b: 0, a: 1 } },
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0, g: 1, b: 0, a: 1 },
                        boundVariables: {
                            color: {
                                id: "VariableID:310:337",
                            },
                        },
                    },
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0, g: 0, b: 1, a: 1 },
                        boundVariables: {
                            color: {
                                id: "VariableID:310:349",
                            },
                        },
                    },
                ],
            };
            expect(getFillColorVariable(node as unknown as SceneNode)).toBe("var(--db-color-bg-success)");
        });

        it("should return 'initial' if no visible solid fills", () => {
            const node = {
                fills: [
                    { type: "GRADIENT", visible: true },
                    { type: "SOLID", visible: false, color: { r: 1, g: 0, b: 0, a: 1 } },
                ],
            };
            expect(getFillColorVariable(node as unknown as SceneNode)).toBe("initial");
        });
    });

    // Get Stroke Variable
    describe("Get Stroke Variable", () => {
        it("should return the CSS custom variable if present in variables.json", () => {
            const node = {
                strokes: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0.2, g: 0.4, b: 0.6, a: 1 },
                        boundVariables: {
                            color: {
                                id: "VariableID:310:307",
                            },
                        },
                    },
                ],
            };
            expect(getStrokeColorVariable(node as unknown as SceneNode)).toBe("var(--db-color-border-brand)");
        });

        it("should return 'initial' if the color is not found in variables.json", () => {
            const node = {
                strokes: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0.1, g: 0.2, b: 0.3, a: 1 },
                        boundVariables: {
                            color: {
                                id: "non-existent-id",
                            },
                        },
                    },
                ],
            };
            expect(getStrokeColorVariable(node as unknown as SceneNode)).toBe("initial");
        });

        it("should return the CSS custom variable without var(...) prefix when withVarPrefix is false", () => {
            const node = {
                strokes: [
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0.2, g: 0.4, b: 0.6, a: 1 },
                        boundVariables: {
                            color: {
                                id: "VariableID:310:307",
                            },
                        },
                    },
                ],
            };
            expect(getStrokeColorVariable(node as unknown as SceneNode, false)).toBe("--db-color-border-brand");
        });

        it("should return 'initial' if no strokes", () => {
            const node = { strokes: [] };
            expect(getStrokeColorVariable(node as unknown as SceneNode)).toBe("initial");
        });

        it("should return the first visible solid stroke's CSS variable", () => {
            const node = {
                strokes: [
                    { type: "GRADIENT", visible: true },
                    { type: "SOLID", visible: false, color: { r: 1, g: 0, b: 0, a: 1 } },
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 1, g: 1, b: 0, a: 1 },
                        boundVariables: {
                            color: {
                                id: "VariableID:310:314",
                            },
                        },
                    },
                    {
                        type: "SOLID",
                        visible: true,
                        opacity: 1,
                        color: { r: 0, g: 0, b: 1, a: 1 },
                        boundVariables: {
                            color: {
                                id: "VariableID:310:322",
                            },
                        },
                    },
                ],
            };
            expect(getStrokeColorVariable(node as unknown as SceneNode)).toBe("var(--db-color-border-warning)");
        });

        it("should return 'initial' if no visible solid strokes", () => {
            const node = {
                strokes: [
                    { type: "GRADIENT", visible: true },
                    { type: "SOLID", visible: false, color: { r: 1, g: 0, b: 0, a: 1 } },
                ],
            };
            expect(getStrokeColorVariable(node as unknown as SceneNode)).toBe("initial");
        });
    });
});


