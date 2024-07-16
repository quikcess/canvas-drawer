# @quikcess/canvas-drawer

### Version 1.1.1

#### **Features:**
  - 🌐 General: 
    - **Opacity**: Added support for text and shapes opacity.
    ```js
    await drawText(ctx, {
      x: "center",
      y: 17,
      text: 'Hello World',
      opacity: 0.170
    });

    await drawRect(ctx, {
      x: "center",
      y: "center",
      width: 50,
      height: 50,
      backgroundColor: "white",
      opacity: 0.02
    });
    ```

  - 📝 TextDrawer:
    - **Segments added**: Build texts with different styles in a single line.
    ```js
    await drawText(ctx, {
      x: "center",
      y: 17,
      segments: [
        { text: 'This ', font: '400 25px Inter', color: '#E8E8E9' },
        { text: 'sentence has ', font: '700 25px Inter', color: '#E8E8E9' },
        { text: 'different weights.', font: '400 25px Inter', color: '#E8E8E9' },
      ]
    });
    ```

  - 🔘 ButtonDrawer:
    - **Align added:** build buttons and make their general alignment using the `align` property.
    ```js
    await drawButton(ctx, {
      x: "center",
      y: 17,
      height: 20,
      align: "right", // default: 'left'
    });
    ```

- **Bug Fixes:**
  - Fixed state and alignment issues in the drawText function.
  - Fixed the width and height properties of the ButtonDrawer icon, as well as its scale.
  - Fixed text centering issue in ButtonDrawer.
  - Fixed problem with automatic height and width on ButtonDrawer.
  - Fixed problem with text-only and icon-only buttons on ButtonDrawer.

### Version 1.1.0

- **Feature Enhancement:**
  - Restructured the library to use functions instead of classes for improved simplicity and ease of use.
  
- **Removed Features:**
  - Removed support for drawing triangles and lines to streamline functionality and focus on core shapes (rectangles and circles).

- **Bug Fixes:**
  - Fixed minor bugs related to gradient rendering in certain edge cases.

### Version 1.0.0

- **Initial Release:**
  - Introduced core functionality for drawing shapes, rendering text, and generating buttons on a canvas using Node.js.
  
- **Shape Drawing:**
  - Supported drawing rectangles with customizable backgrounds, borders, and gradients.
  - Enabled creation of circles with flexible styling options.

- **Text Rendering:**
  - Provided capabilities to render text with various fonts, colors, and alignment settings.

- **Button Generation:**
  - Implemented features to generate buttons with text, icons, and adjustable styles.

- **Gradient Support:**
  - Added support for applying linear gradients to shapes for vibrant visual effects.