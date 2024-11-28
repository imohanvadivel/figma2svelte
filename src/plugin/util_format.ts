export function formatCode(code: string): string {
  const { scriptBlock, styleBlock, htmlBlock } = separateBlocks(code);
  
  const formattedScript = formatScriptBlock(scriptBlock);
  const formattedStyle = formatStyleBlock(styleBlock);
  const formattedHtml = formatHtmlBlock(htmlBlock);

  return [formattedScript, formattedHtml, formattedStyle].filter(Boolean).join('\n\n');
}

function separateBlocks(code: string): { scriptBlock: string, styleBlock: string, htmlBlock: string } {
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  
  const scriptBlock = scriptMatch ? scriptMatch[0] : '';
  const styleBlock = styleMatch ? styleMatch[0] : '';
  
  let htmlBlock = code
      .replace(scriptBlock, '')
      .replace(styleBlock, '')
      .trim();

  return { scriptBlock, styleBlock, htmlBlock };
}

function formatScriptBlock(scriptBlock: string): string {
  if (!scriptBlock) return '';

  const scriptMatch = scriptBlock.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) return '';

  const scriptContent = scriptMatch[1].trim();
  const formattedContent = formatScriptContent(scriptContent);

  return `<script>\n${formattedContent}\n</script>`;
}

function formatScriptContent(content: string): string {
  const lines = content.split(';').map(line => line.trim()).filter(Boolean);
  const importLines = lines.filter(line => line.startsWith('import '));
  const otherLines = lines.filter(line => !line.startsWith('import '));

  const formattedImports = importLines.map(line => {
    // Remove extra spaces within import statements and add space after commas
    return `\t${line.replace(/\s*,\s*/g, ', ').replace(/\s*{\s*/g, ' { ').replace(/\s*}\s*/g, ' } ')};`;
  }).join('\n');
  const formattedOthers = otherLines.map(line => `\t${line};`).join('\n');

  return [formattedImports, formattedOthers].filter(Boolean).join('\n\n');
}

function formatStyleBlock(styleBlock: string): string {
  if (!styleBlock) return '';

  const styleMatch = styleBlock.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (!styleMatch) return '';

  const styleContent = styleMatch[1].trim();
  const formattedContent = formatStyleContent(styleContent);

  return `<style>\n${formattedContent}\n</style>`;
}

function formatStyleContent(content: string): string {
  const rules = content.split('}').filter(Boolean);
  
  return rules.map(rule => {
    const [selector, styles] = rule.split('{');
    if (!styles) return '';

    const formattedStyles = styles.split(';')
      .filter(style => style.trim())
      .map(style => `\t\t${style.trim()};`)
      .join('\n');

    return `\t${selector.trim()} {\n${formattedStyles}\n\t}`;
  }).join('\n\n');
}

function formatHtmlBlock(htmlBlock: string): string {
  const lines = htmlBlock.split(/(?=<|$)/);
  let formattedHtml = '';
  let indentLevel = 0;
  const indentStack = [];

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith('</')) {
      if (indentStack.length > 0 && indentStack[indentStack.length - 1] === line.slice(2, -1)) {
        indentLevel--;
        indentStack.pop();
      }
    }

    if (line) {
      formattedHtml += `${'\t'.repeat(indentLevel)}${line}\n`;
    }

    if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
      const tagName = line.split(/\s+/)[0].slice(1);
      if (!['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) {
        indentLevel++;
        indentStack.push(tagName);
      }
    }
  }

  return formattedHtml.trim();
}