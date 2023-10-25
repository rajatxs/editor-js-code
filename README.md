# Custom Code Plugin for Editor.js

The Custom Code Plugin for Editor.js enables you to incorporate code examples into your articles, along with a dropdown for selecting the language mode.

> This plugin is compatible with Vite 4.

![Preview](https://res.cloudinary.com/dcwxfpep4/image/upload/v1698238204/screens/urdh4xfraz4dmim3lbsb.webp)

## Installation

Install plugin in your existing project.

```shell
npm i @rxpm/editor-js-code
```

## Usage

Include plugin in your application.

```javascript
import CodeTool from '@rxpm/editor-js-code';
```

Register the plugin in the `tools` property of the Editor.js configuration.

```javascript
const editor = EditorJS({
  ...
  tools: {
    code: CodeTool
  }

  ...
});
```

Provide additional language modes.

```javascript
const editor = EditorJS({
  ...
  tools: {
    code: {
      class: CodeTool,
      config: {
        modes: {
          'js': 'JavaScript',
          'py': 'Python',
          'go': 'Go',
          'cpp': 'C++',
          'cs': 'C#',
          'md': 'Markdown',
        },
        defaultMode: 'go',
      },
    }
  }

  ...
});
```

## Config Params

This plugin supports additional configuration parameters.

| Field       | Type     | Description                    | Default                    |
| ----------- | -------- | -------------------------------| ---------------------------|
| placeholder | `string` | Placeholder string | `Enter a code` |
| modes | `object` | Supported language modes | `{ text: "Plain Text" }` |
| defaultMode | `string` | Default selected language mode | `text` |

## Output Data

Editor.js will produce the following code block.

```json
{
  "type": "code",
  "data": {
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n    messages := make(chan string)\n\n    go func() { messages <- \"ping\" }()\n\n    msg := <-messages\n    fmt.Println(msg)\n}",
    "mode": "go"
  }
}
```

For more information or inquiries, please contact the project owner: Rajat (rxx256+github@outlook.com)
