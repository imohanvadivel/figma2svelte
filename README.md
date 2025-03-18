The Figma to Svelte plugin is designed to seamlessly generate Svelte code for the [Deskblocks design system](https://deskblocks.mohanvadivel.com/). It converts selected Figma frames into Svelte code instantly, automatically importing the necessary components from the Deskblocks library.



## Key Features

- Effortless Code Generation: Converts Figma frames into Svelte code that is ready to use in your Zoho Desk extension project.
- Built-in Theming: Deskblocks handles appearance settings (light and dark mode), themes (blue, red, green, orange, yellow), and font selections (Puvi, Lato, Roboto)—"it just works."
- AI-Powered Refinement: Optionally use the Claude 3.5 Haiku model to refine the generated code into production-ready quality.


## How to Use

- Select the Figma frame you want to convert.
- Run the plugin to instantly generate Svelte code for the selected frame.
- (Optional) Add your Anthropic API key to enable production-ready code generation using Claude 3.5 Haiku.
- The generated code is ready to copy and paste into your Zoho Desk extension.



## Key Guidelines

- Component Naming: Keep the original component names to ensure proper functionality, as the plugin relies on these names for performance.
- Autolayout Usage: Use autolayout instead of static frames for better responsive CSS translation.
- Radio Button Grouping: Group radio buttons in a separate autolayout (excluding the header) to ensure proper linking in the generated code.


## AI Integration

The plugin leverages AI for advanced code refinement. The Claude 3.5 Haiku model is both fast and cost-effective, producing high-quality, production-ready code.

- Secure and Local: Your Anthropic API key is stored locally, ensuring privacy and security.
- Affordable: Claude 3.5 Haiku costs just $1 per million tokens, making it highly cost-effective—a $10 can support extensive usage.


## Note

This is the initial version of the plugin and may have some limitations. Future updates will address these. If you encounter any issues or have suggestions, feel free to provide feedback.