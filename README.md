
<div align="center">
  <img alt="CanvasDrawer Banner" src="https://example.com/path/to/banner.png">
</div>

<h1 align="center">CanvasDrawer</h1>

<p align="center">Library for drawing shapes on a canvas using Node.js, Discord.js and Napi Canvas.</p>

<div align="center">
  <div style="width: fit-content; display: flex; align-items: flex-start; gap: 4px;">
    <img alt="NPM License" src="https://img.shields.io/npm/l/canvas-drawer">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/canvas-drawer">
    <a href="https://npmjs.com/package/canvas-drawer">
      <img alt="NPM Version" src="https://img.shields.io/npm/v/canvas-drawer">
    </a>
  </div>
</div>

## Installation

```bash
npm install canvas-drawer
// or
yarn add canvas-drawer
// or
pnpm add canvas-drawer
```

## Documentation

Visit our [official API documentation](https://docs.yourproject.com) for more information about this library.

## Getting Started

- _Clone the repository from [GitHub](https://github.com/yourusername/canvas-drawer)._

```js
const { CanvasDrawer } = require('canvas-drawer');

const canvas = new CanvasDrawer(800, 600);

canvas.drawRect({
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  backgroundColor: 'blue'
});

canvas.drawCircle({
  x: 400,
  y: 300,
  radius: 50,
  backgroundColor: 'red',
  borderWidth: '2px',
  borderColor: 'black'
});

const buffer = canvas.getBuffer(); // Use buffer as needed
```

### Drawing Shapes

#### `drawRect(options)`

Draws a rectangle on the canvas.

- **Parameters:**
  - `options`: Object with rectangle options.

- **Returns:** Object with dimensions of the drawn rectangle.

#### `drawCircle(options)`

Draws a circle on the canvas.

- **Parameters:**
  - `options`: Object with circle options.

- **Returns:** Object with dimensions of the drawn circle.

## Advanced Usage

### Working with Attachments in Discord

#### `generateAttachment(fileName, [mimeType])`

Generates a Discord attachment from the canvas.

- **Parameters:**
  - `fileName`: Name of the attachment file.
  - `mimeType` (optional): MIME type of the attachment (default is "image/jpeg").

- **Returns:** Promise resolving to an `AttachmentBuilder` object.

### Working with Buffer

#### `getBuffer()`

Returns the current canvas image buffer as an image buffer.

- **Usage:**
  ```js
  const { CanvasDrawer } = require('canvas-drawer');

  const canvas = new CanvasDrawer(800, 600);

  const buffer = CanvasDrawer.getBuffer(); // Use buffer as needed
  ```

- **Returns:**
  - A buffer containing the image rendered on the canvas.


### Customizing Drawings

#### `setContext(ctx)`

Sets a custom 2D context for the canvas.

- **Parameters:**
  - `ctx`: New 2D context to be set.

## Contributing

We welcome contributions! Please submit issues or pull requests to our [GitHub repository](https://github.com/eydrenn/canvas-drawer).

## Authors

- [@eydrenn](https://github.com/eydrenn)