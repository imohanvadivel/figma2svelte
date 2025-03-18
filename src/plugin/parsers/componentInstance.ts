import {
    convertDateTimeToISOFormat,
    convertDateToISOFormat,
    convertTimeToISOFormat,
    createSlug,
    getUniqueId,
    type ParsedCode,
} from "../util.ts";

export function parseComponentInstance(node: InstanceNode): ParsedCode {
    let script = "";
    let code = "";
    let style = "";

    // check visibility
    if (node.visible === false) return { script, code, style };
    
    const componentName = node.name;

    // Get the component's properties
    const properties = node.componentProperties;

    /* ============== Button ============== */

    if (componentName === "Button") {
        script = `import { Button } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const variant = properties.variant.value;

        const labelKey = Object.keys(properties).find((key) => key.startsWith("label")) as string;
        const label = properties[labelKey].value;

        // const leftIconKey = Object.keys(properties).find((key) => key.startsWith("left-icon")) as string;
        // const leftIcon = properties[leftIconKey].value;

        code = `<Button disabled={${disabled}} variant="${variant}">${label}</Button>`;
        style = ``;
    }

    /* ============== Checkbox ============== */

    if (componentName === "Checkbox") {
        const checked = properties.checked.value;
        const disabled = properties.disabled.value;
        let label: string = "";

        const checkboxId = `checkbox_${node.id.replace(/[^a-zA-Z0-9]/g, "")}`;

        const showLabelKey = Object.keys(properties).find((key) => key.startsWith("showLabel")) as string;
        const showLabel = properties[showLabelKey].value;

        if (showLabel) {
            const labelKey = Object.keys(properties).find((key) => key.startsWith("label")) as string;
            label = properties[labelKey].value as string;
        }

        if (label) {
            code = `<Checkbox bind:checked={${checkboxId}Checked} disabled={${disabled}}>${label}</Checkbox>`;
        } else {
            code = `<Checkbox bind:checked={${checkboxId}Checked} disabled={${disabled}}></Checkbox>`;
        }
        style = ``;

        script = `import { Checkbox } from "deskblocks";\n let ${checkboxId}Checked = ${checked};\n`;
    }

    /* ============== Radio ============== */

    if (componentName === "Radio") {
        script = `import { Radio } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        let label: string = "";

        const showLabelKey = Object.keys(properties).find((key) => key.startsWith("showLabel")) as string;
        const showLabel = properties[showLabelKey].value;

        if (showLabel) {
            const labelKey = Object.keys(properties).find((key) => key.startsWith("label")) as string;
            label = properties[labelKey].value as string;
        }

        const value = createSlug(label);

        if (label) {
            code = `<Radio disabled={${disabled}} value="${value}">${label}</Radio>`;
        } else {
            code = `<Radio disabled={${disabled}} value="${value}"></Radio>`;
        }
        style = ``;
    }

    /* ============== Switch ============== */

    if (componentName === "Switch") {
        script = `import { Switch } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const checked = properties.checked.value;
        const size = properties.size.value;

        const switchId = getUniqueId();

        code = `<Switch bind:checked={${switchId}Checked} size="${size}" disabled={${disabled}}></Switch>`;
        style = ``;
        script = `import { Switch } from "deskblocks";\n let ${switchId}Checked = ${checked};\n`;
    }

    /* ============== Text Input ============== */

    if (componentName === "Text Input") {
        script = `import { TextInput } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const invalid = properties.invalid.value;
        const valueKey = Object.keys(properties).find((key) => key.startsWith("value")) as string;
        const value = properties[valueKey].value;

        code = `<TextInput disabled={${disabled}} invalid={${invalid}} value="${value}"></TextInput>`;
        style = ``;
    }

    /* ============== Number Input ============== */

    if (componentName === "Number Input") {
        script = `import { NumberInput } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const invalid = properties.invalid.value;
        const valueKey = Object.keys(properties).find((key) => key.startsWith("value")) as string;
        const value = properties[valueKey].value;

        code = `<NumberInput disabled={${disabled}} invalid={${invalid}} value={${value}}></NumberInput>`;
        style = ``;
    }

    /* ============== Date Input ============== */

    if (componentName === "Date Input") {
        script = `import { DateInput } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const invalid = properties.invalid.value;
        const valueKey = Object.keys(properties).find((key) => key.startsWith("value")) as string;
        const value = properties[valueKey].value as string;
        const isoValue = convertDateToISOFormat(value);

        code = `<DateInput disabled={${disabled}} invalid={${invalid}} value="${isoValue}"></DateInput>`;
        style = ``;
    }

    /* ============== Time Input ============== */

    if (componentName === "Time Input") {
        script = `import { TimeInput } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const invalid = properties.invalid.value;
        const valueKey = Object.keys(properties).find((key) => key.startsWith("value")) as string;
        const value = properties[valueKey].value as string;
        const isoValue = convertTimeToISOFormat(value);

        code = `<TimeInput disabled={${disabled}} invalid={${invalid}} value="${isoValue}"></TimeInput>`;
        style = ``;
    }

    /* ============== Datetime Input ============== */

    if (componentName === "DateTime Input") {
        script = `import { DateTimeInput } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const invalid = properties.invalid.value;
        const valueKey = Object.keys(properties).find((key) => key.startsWith("value")) as string;
        const value = properties[valueKey].value as string;
        const isoValue = convertDateTimeToISOFormat(value);

        code = `<DateTimeInput disabled={${disabled}} invalid={${invalid}} value="${isoValue}"></DateTimeInput>`;
        style = ``;
    }

    /* ============== Select ============== */

    if (componentName === "Select") {
        const selectId = getUniqueId();

        const disabled = properties.disabled.value;
        const invalid = properties.invalid.value;
        const multiSelectKey = Object.keys(properties).find((key) => key.startsWith("multiselect")) as string;
        const multiSelect = properties[multiSelectKey].value as boolean;

        let maxSelect: number | null = 1;
        if (multiSelect) maxSelect = null;

        let options: string[] = [];

        node.exposedInstances.forEach((chipInstance, index) => {
            if (chipInstance.type !== "INSTANCE" || chipInstance.name !== "Chip") return;

            const labelKey = Object.keys(chipInstance.componentProperties).find((key) => key.startsWith("label")) as string;
            const label = chipInstance.componentProperties[labelKey].value as string;

            options.push(`"${label}"`);
        });

        let value = [...options];

        if (!multiSelect) value = [value[0]];

        script = `import { Select } from "deskblocks";\n let SelectOptions_${selectId} = [${options}];\n let selectValue_${selectId} = [${value}];\n`;
        code = `<Select disabled={${disabled}} invalid={${invalid}} maxSelect={${maxSelect}} options={SelectOptions_${selectId}} bind:selected={selectValue_${selectId}}></Select>`;
        style = ``;
    }

    /* ============== Form Label ============== */

    if (componentName === "Form Label") {
        script = `import { FormLabel } from "deskblocks";\n`;
        const required = properties.required.value;
        const disabled = properties.disabled.value;

        const labelKey = Object.keys(properties).find((key) => key.startsWith("label")) as string;
        const label = properties[labelKey].value as string;

        code = `<FormLabel required={${required}} disabled={${disabled}}>${label}</FormLabel>`;
        style = ``;
    }

    /* ============== Form Help Message ============== */

    if (componentName === "Form Help Message") {
        script = `import { FormHelpMsg } from "deskblocks";\n`;
        const invalid = properties.invalid.value;
        const disabled = properties.disabled.value;

        const messageKey = Object.keys(properties).find((key) => key.startsWith("message")) as string;
        const message = properties[messageKey].value as string;

        code = `<FormHelpMsg invalid={${invalid}} disabled={${disabled}}>${message}</FormHelpMsg>`;
        style = ``;
    }

    /* ============== Textarea ============== */

    if (componentName === "Textarea") {
        script = `import { Textarea } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const valueKey = Object.keys(properties).find((key) => key.startsWith("value")) as string;
        const value = properties[valueKey].value as string;

        code = `<Textarea resize="vertical" disabled={${disabled}} value="${value}"></Textarea>`;
        style = ``;
    }

    /* ============== Tabs ============== */

    if (componentName === "Tabs") {
        script = `import { Tabs, TabItem } from "deskblocks";\n`;
        const background = properties.background.value;
        const tabItemInstances = node.children as InstanceNode[];

        let tabItemString = "";

        tabItemInstances.forEach((tabItemInstance) => {
            if (tabItemInstance.type !== "INSTANCE" || tabItemInstance.name !== "_TabItem") return;

            const active = tabItemInstance.componentProperties.active.value;
            const nameKey = Object.keys(tabItemInstance.componentProperties).find((key) => key.startsWith("name")) as string;
            const name = tabItemInstance.componentProperties[nameKey].value as string;

            tabItemString += `<TabItem title="${name}" ${active === "true" ? "open" : ""}></TabItem>`;
        });

        code = `<Tabs ${background === "true" ? "background" : ""}>${tabItemString}</Tabs>`;

        style = ``;
    }

    /* ============== Avatar ============== */

    if (componentName === "Avatar") {
        script = `import { Avatar } from "deskblocks";\n`;

        const size = properties.size.value;
        const initialKey = Object.keys(properties).find((key) => key.startsWith("initial")) as string;
        const initial = properties[initialKey].value as string;

        code = `<Avatar size="${size}" name="${initial}"></Avatar>`;
        style = ``;
    }

    /* ============== Spinner ============== */

    if (componentName === "Spinner") {
        script = `import { Spinner } from "deskblocks";\n`;
        const size = properties.size.value;
        const onbrand = properties.onbrand.value;

        code = `<Spinner size="${size}" ${onbrand === "true" ? "onbrand" : ""}></Spinner>`;
        style = ``;
    }

    /* ============== Chip ============== */

    if (componentName === "Chip") {
        script = `import { Chip } from "deskblocks";\n`;
        const disabled = properties.disabled.value;
        const dismissible = properties.dismissible.value;
        const labelKey = Object.keys(properties).find((key) => key.startsWith("label")) as string;
        const label = properties[labelKey].value as string;

        code = `<Chip disabled={${disabled}} ${dismissible === "true" ? "dismissible" : ""}>${label}</Chip>`;
        style = ``;
    }

    return { script, code, style };
}
