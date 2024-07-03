
<div align="center">
  <img alt="CanvasDrawer Banner" src="https://i.ibb.co/vxCbchW/Quikcess-Banner1-github.png">
</div>

<h1 align="center">CanvasDrawer</h1>

<p align="center">Library for drawing shapes on a canvas using Node.js, Discord.js, and Napi Canvas.</p>

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
# or
yarn add canvas-drawer
# or
pnpm add canvas-drawer
```

<!-- 
## Documentation

Visit our [official API documentation](https://docs.yourproject.com) for more information about this library. -->

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
  borderWidth: 2,
  borderColor: 'black'
});

const buffer = canvas.getBuffer(); // Use buffer as needed
```

### Drawing Shapes

#### `drawRect(options)`

Draws a rectangle on the canvas.

- **Parameters:**
  - `options`: Object with rectangle options.
    - `x`: Horizontal position of the rectangle.
    - `y`: Vertical position of the rectangle.
    - `width`: Width of the rectangle.
    - `height`: Height of the rectangle.
    - `backgroundColor`: Background color of the rectangle.
    - `backgroundImage`: Background image of the rectangle.
    - `backgroundGradient`: Background gradient of the rectangle.
    - `borderColor`: Border color of the rectangle.
    - `borderGradient`: Border gradient of the rectangle.
    - `borderWidth`: Border width of the rectangle.
    - `borderRadius`: Corner radius of the rectangle.
    - `reference`: Reference for positioning the rectangle relative to another element.

- **Returns:** Object with dimensions of the drawn rectangle.

#### `drawCircle(options)`

Draws a circle on the canvas.

- **Parameters:**
  - `options`: Object with circle options.
    - `x`: Horizontal position of the circle.
    - `y`: Vertical position of the circle.
    - `radius`: Radius of the circle.
    - `backgroundColor`: Background color of the circle.
    - `backgroundGradient`: Background gradient of the circle.
    - `backgroundImage`: Background image of the circle.
    - `borderColor`: Border color of the circle.
    - `borderGradient`: Border gradient of the circle.
    - `borderWidth`: Border width of the circle.
    - `reference`: Reference for positioning the circle relative to another element.

- **Returns:** Object with dimensions of the drawn circle.

#### `drawLine(options)`

Draws a line on the canvas.

- **Parameters:**
  - `options`: Object with line options.
    - `startX`: Starting horizontal position of the line.
    - `startY`: Starting vertical position of the line.
    - `endX`: Ending horizontal position of the line.
    - `endY`: Ending vertical position of the line.
    - `lineWidth`: Width of the line.
    - `lineColor`: Color of the line.
    - `lineCap`: Style of the line's end caps (e.g., 'butt', 'round', 'square').

- **Returns:** Object with details of the drawn line.

#### `drawTriangle(options)`

Draws a triangle on the canvas.

- **Parameters:**
  - `options`: Object with triangle options.
    - `x`: Horizontal position of the triangle.
    - `y`: Vertical position of the triangle.
    - `size`: Size of the triangle.
    - `backgroundColor`: Background color of the triangle.
    - `backgroundImage`: Background image of the triangle.
    - `backgroundGradient`: Background gradient of the triangle.
    - `borderGradient`: Border gradient of the triangle.
    - `borderColor`: Border color of the triangle.
    - `borderWidth`: Border width of the triangle.
    - `reference`: Reference for positioning the triangle relative to another element.

- **Returns:** Object with dimensions of the drawn triangle.

### Advanced Usage

#### `generateAttachment(fileName, options)`

Generates a Discord attachment from the canvas.

- **Parameters:**
  - `fileName`: Name of the attachment file.
  - `options`: Object with options.
    - `mimeType`: MIME type of the attachment (default is "image/jpeg").
    - `quality`: Quality of the image (0 to 100, default is 100).

- **Returns:** Promise resolving to an `AttachmentBuilder` object.

### Working with Buffer

#### `getBuffer(mimeType = "image/jpeg", quality = 100)`

Returns the current canvas image as a buffer.

- **Parameters:**
  - `mimeType`: MIME type of the buffer (default is "image/jpeg").
  - `quality`: Quality of the image (0 to 100, default is 100).

- **Returns:**
  - A buffer containing the image rendered on the canvas.

### Customizing Drawings

#### `setContext(ctx)`

Sets a custom 2D context for the canvas.

- **Parameters:**
  - `ctx`: New 2D context to be set.

### Cache Management

#### `clearCache(options)`

Clears the cache based on the provided options.

- **Parameters:**
  - `options`: Options to specify which parts of the cache to clear.
    - `images`: Whether to clear the image cache (default: true).
    - `elements`: Whether to clear the elements cache (default: true).

### Using Gradient

#### `backgroundGradient`

Different ways to make a gradient

#####  Stops:

```js
await canvasDrawer.drawRect({
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  backgroundGradient: {
    angle: 45, // Angle in degrees
    stops: [
      { offset: 0, color: 'red' },
      { offset: 0.5, color: 'blue' },
      { offset: 1, color: 'green' }
    ]
  }
});
```

##### Using an Array of Colors:

```js
await canvasDrawer.drawRect({
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  backgroundGradient: ["blue", "pink", "red"]
});
```

##### Using a Space-Separated String of Colors:

```js
await canvasDrawer.drawRect({
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  backgroundGradient: "blue pink red"
});
```

### Notes:

- The `angle` property defines the direction of the gradient. For example, an angle of 0 degrees will create a gradient from left to right, while an angle of 90 degrees will create a gradient from top to bottom.
- If no `offset` is specified in `stops`, the colors will be evenly distributed along the gradient.

### Example Code for Drawing a Gradient Rectangle

```js
const { CanvasDrawer } = require('canvas-drawer');

const canvas = new CanvasDrawer(800, 600);

canvas.drawRect({
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  backgroundGradient: {
    angle: 45, // Angle in degrees
    stops: [
      { offset: 0, color: 'red' },
      { offset: 0.5, color: 'blue' },
      { offset: 1, color: 'green' }
    ]
  }
});

const buffer = canvas.getBuffer(); // Use buffer as needed
```

## Contributing

We welcome contributions! Please submit issues or pull requests to our [GitHub repository](https://github.com/eydrenn/canvas-drawer).

## Authors

- [@eydrenn](https://github.com/eydrenn)