<div align="center">
  <img alt="CanvasDrawer Banner" src="https://i.ibb.co/vxCbchW/Quikcess-Banner1-github.png">
</div>

<h1 align="center">CanvasDrawer</h1>

<p align="center">Library to efficiently draw shapes, texts, buttons on a canvas using Node.js.</p>

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
const { createCanvas } = require('@napi-rs/canvas');
const { drawRect, drawCircle } = require("canvas-drawer");

const canvas = createCanvas(800, 600);
const ctx = canvas.getContext("2d");

await drawRect({
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  backgroundColor: 'blue'
});

await drawCircle({
  x: 400,
  y: 300,
  radius: 50,
  backgroundColor: 'red',
  borderWidth: 2,
  borderColor: 'black'
});

const buffer = canvas.toBuffer("image/png"); // Use buffer as needed
```

### Drawing Shapes

#### `RectDrawer(options)`

Draws a rounded rectangle on the canvas.

- **Parameters:**
  - `options`: Object with rectangle options.
    - `x`: The x-coordinate of the top-left corner.
    - `y`: The y-coordinate of the top-left corner.
    - `width`: The width of the rectangle.
    - `height`: The height of the rectangle.
    - `backgroundColor`: The background color of the rectangle.
    - `backgroundImage`: The URL or path to the background image.
    - `backgroundGradient`: The gradient for the background.
    - `borderColor`: The border color of the rectangle.
    - `borderWidth`: The width of the rectangle's border.
    - `borderGradient`: The gradient for the border.
    - `borderStyle`: The style of the border ('solid', 'dashed', 'dotted').
    - `borderRadius`: The radius of the rectangle's corners.
    - `reference`: Reference object for positioning.

- **Returns:** Object with dimensions of the drawn rectangle.

#### `drawCircle(options)`

Draws a circle on the canvas.

- **Parameters:**
  - `options`: Object with circle options.
    - `x`: X-coordinate of the circle's center.
    - `y`: Y-coordinate of the circle's center.
    - `radius`: Radius of the circle.
    - `backgroundColor`: Background color of the circle.
    - `backgroundImage`: URL or path to the background image of the circle.
    - `backgroundGradient`: Background gradient of the circle.
    - `borderColor`: Color of the circle's border.
    - `borderGradient`: Color gradient of the circle's border.
    - `borderWidth`: Width of the circle's border.
    - `reference`: Reference object for positioning.

- **Returns:** Object with dimensions of the drawn circle.

#### `drawText(options)`

Draws text on the canvas.

- **Parameters:**
  - `options`: Object with text options.
    - `text`: The text to draw.
    - `x`: The x-coordinate of the text or 'center' to center horizontally.
    - `y`: The y-coordinate of the text or 'center' to center vertically.
    - `font`: Font style for the text (default: '30px sans-serif').
    - `color`: Color of the text (default: '#000000').
    - `align`: Text alignment ('start', 'end', 'left', 'right', 'center'; default: 'start').
    - `baseline`: Text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'; default: 'alphabetic').
    - `reference`: Reference object for positioning.

- **Returns:** Object with the calculated positions and applied styles.

#### `drawButton(options)`

Draws a button on the canvas.

- **Parameters:**
  - `options`: Object with button options.
    - `x`: The x-coordinate of the top-left corner.
    - `y`: The y-coordinate of the top-left corner.
    - `width`: The fixed width of the button.
    - `height`: The fixed height of the button.
    - `padding`: The padding around the button (default: 5).
    - `backgroundColor`: The background color of the button.
    - `backgroundImage`: The URL or path to the background image.
    - `backgroundGradient`: The gradient for the background.
    - `borderColor`: The border color of the button.
    - `borderWidth`: The width of the button's border (default: 1).
    - `borderGradient`: The gradient for the border.
    - `borderStyle`: The style of the border ('solid', 'dashed', 'dotted'; default: 'solid').
    - `borderRadius`: The radius of the button's corners (default: 0).
    - `text`: The text to display on the button.
    - `font`: The font style for the text (default: '30px sans-serif').
    - `color`: The color of the text (default: '#000').
    - `iconURL`: The URL or path to the icon image.
    - `iconPosition`: The position of the icon relative to the text ('left' or 'right'; default: 'left').
    - `iconTextSpacing`: The spacing between the icon and the text (default: 10).
    - `iconScale`: The scale factor for the icon size.
    - `reference`: Reference object for positioning.

- **Returns:** Promise resolving to an object with dimensions of the drawn button.

### Advanced Usage

See below the advanced use of the canvas drawer library.

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

#### Notes:

- The `angle` property defines the direction of the gradient. For example, an angle of 0 degrees will create a gradient from left to right, while an angle of 90 degrees will create a gradient from top to bottom.
- If no `offset` is specified in `stops`, the colors will be evenly distributed along the gradient.

#### Example Code for Drawing a Gradient Rectangle

```js
const { createCanvas } = require('@napi-rs/canvas');
const { drawRect } = require("canvas-drawer");

const canvas = createCanvas(800, 600);
const ctx = canvas.getContext("2d");

await drawRect({
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

const buffer = canvas.toBuffer("image/png"); // Use buffer as needed
```

### Example Code for Drawing a Button

```js
const { createCanvas } = require('@napi-rs/canvas');
const { drawButton } = require("canvas-drawer");

const canvas = createCanvas(800, 600);
const ctx = canvas.getContext("2d");

await drawButton({
  x: 100,
  y: 200,
  width: 200,
  height: 100,
  backgroundColor: 'blue',
  text: 'Click Me',
  color: 'white',
  font: '20px Arial',
  borderColor: 'black',
  borderWidth: 2,
  borderRadius: 10,
  iconURL: 'path/to/icon.png',
  iconPosition: 'left',
  iconTextSpacing: 10
});

const buffer = canvas.toBuffer("image/png"); // Use buffer as needed
```

#### Notes:
- This code will draw a button with a blue background, white text that says "Click Me," and an icon to the left of the text. The button will have a black border with a width of 2 pixels and rounded corners with a radius of 10 pixels.

## Contributing

We welcome contributions! Please submit issues or pull requests to our [GitHub repository](https://github.com/eydrenn/canvas-drawer).

## Authors

- [@eydrenn](https://github.com/eydrenn)