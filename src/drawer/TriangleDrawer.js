const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { cache } = require('./CacheManager');
const { pxToNumber, pixelParser, calculatePosition } = require('./CanvasHelper');

class TriangleDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  /**
   * Draws a triangle on the canvas.
   * @param {object} options - Options for drawing the triangle.
   * @param {number|string} options.x - Horizontal position of the triangle (can be numeric or 'center').
   * @param {number|string} options.y - Vertical position of the triangle (can be numeric or 'center').
   * @param {number} options.size - Size of the triangle (base and height will be the same).
   * @param {string} [options.backgroundColor='transparent'] - Background color of the triangle.
   * @param {string} [options.backgroundImage] - URL or path to the background image of the triangle.
   * @param {object|string|array} [options.backgroundGradient] - Background gradient of the triangle.
   * @param {string} [options.borderColor] - Border color of the triangle.
   * @param {object|string|array} [options.borderGradient] - Color gradient of the triangle's border.
   * @param {number} [options.borderWidth=0] - Border width of the triangle.
   * @param {object} [lastReference] - Last reference object for positioning.
   * @returns {Promise<object>} Object containing the triangle's details.
   */
  async drawTriangle(options = {}, lastReference = null) {
    const { x, y, size, backgroundColor = 'transparent', backgroundImage, backgroundGradient, borderColor, borderGradient, borderWidth = 0, reference } = pixelParser(options);

    const { posX, posY } = calculatePosition({
      ctx: this.ctx,
      shape: 'triangle',
      x,
      y,
      size,
      borderWidth,
      reference,
      lastReference,
    });

    // // Convert position values if 'center' or 'center' is provided
    // let posX = x === 'center' ? (this.canvas.width - size - borderWidth * 2) / 2 : x;
    // let posY = y === 'center' ? (this.canvas.height - size - borderWidth * 2) / 2 : y;

    // if (reference) {
    //   let referenceNow=reference;
    //   if (reference === 'auto' && lastReference) {
    //     referenceNow=lastReference;
    //   }
    //   if (x === 'center') {
    //     posX = referenceNow.x + (referenceNow.width || 0) / 2 - size / 2 - borderWidth;
    //   }

    //   if (y === 'center') {
    //     posY = referenceNow.y + (referenceNow.height || 0) / 2 - size / 2 - borderWidth;
    //   }
    // }

    const cacheKey = JSON.stringify({ size, backgroundColor, backgroundImage, backgroundGradient, borderColor, borderGradient, borderWidth, shape: 'triangle' });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], posX, posY); // Draw cached image directly
      return { x: posX - borderWidth, y: posY - borderWidth, width: size + borderWidth * 2, height: size + borderWidth * 2, size, shape: 'triangle' };
    }

    // Create off-screen canvas for drawing the triangle
    const offScreenCanvas = createCanvas(size + borderWidth * 2, size + borderWidth * 2); // Increase canvas size to accommodate border
    const offScreenCtx = offScreenCanvas.getContext('2d');

    offScreenCtx.save();

    // Draw triangle background with gradient if provided
    if (backgroundGradient) {
      let gradientColors;
      let gradientAngle = 0; // Default angle

      if (Array.isArray(backgroundGradient)) { // If backgroundGradient is an array of colors
        gradientColors = backgroundGradient;
      } else if (typeof backgroundGradient === 'string') { // If backgroundGradient is a string of colors separated by spaces
        gradientColors = backgroundGradient.split(' ');
      } else { // If backgroundGradient is an object with stops or colors
        const { angle = 0, stops, colors } = backgroundGradient;
        gradientAngle = angle;
        if (stops) {
          gradientColors = stops.map(stop => stop.color);
        } else if (colors) {
          gradientColors = Array.isArray(colors) ? colors : colors.split(' ');
        }
      }

      const radianAngle = (gradientAngle * Math.PI) / 180;
      const x0 = (size + borderWidth * 2) / 2 + ((size + borderWidth * 2) / 2) * Math.cos(radianAngle - Math.PI / 2);
      const y0 = (size + borderWidth * 2) / 2 + ((size + borderWidth * 2) / 2) * Math.sin(radianAngle - Math.PI / 2);
      const x1 = (size + borderWidth * 2) / 2 + ((size + borderWidth * 2) / 2) * Math.cos(radianAngle + Math.PI / 2);
      const y1 = (size + borderWidth * 2) / 2 + ((size + borderWidth * 2) / 2) * Math.sin(radianAngle + Math.PI / 2);

      const gradient = offScreenCtx.createLinearGradient(x0, y0, x1, y1);

      gradientColors.forEach((color, index) => {
        const offset = index / (gradientColors.length - 1);
        gradient.addColorStop(offset, color);
      });

      offScreenCtx.fillStyle = gradient;
    } else {
      offScreenCtx.fillStyle = backgroundColor;
    }

    offScreenCtx.beginPath();
    offScreenCtx.moveTo((size + borderWidth * 2) / 2, borderWidth); // Move to the top vertex
    offScreenCtx.lineTo(borderWidth, (size + borderWidth * 2) - borderWidth); // Line to the bottom-left vertex
    offScreenCtx.lineTo((size + borderWidth * 2) - borderWidth, (size + borderWidth * 2) - borderWidth); // Line to the bottom-right vertex
    offScreenCtx.closePath();
    offScreenCtx.fill();

    // Draw background image if provided
    if (backgroundImage) {
      try {
        const image = await loadImage(backgroundImage);
        offScreenCtx.drawImage(image, borderWidth, borderWidth, size, size);
      } catch (error) {
        console.error(`Failed to load background image: ${error}`);
      }
    }

    // Draw triangle border with gradient if provided
    if (borderGradient && borderWidth > 0) {
      let gradientColors;
      let gradientAngle = 0; // Default angle

      if (Array.isArray(borderGradient)) { // If borderGradient is an array of colors
        gradientColors = borderGradient;
      } else if (typeof borderGradient === 'string') { // If borderGradient is a string of colors separated by spaces
        gradientColors = borderGradient.split(' ');
      } else { // If borderGradient is an object with stops or colors
        const { angle = 0, stops, colors } = borderGradient;
        gradientAngle = angle;
        if (stops) {
          gradientColors = stops.map(stop => stop.color);
        } else if (colors) {
          gradientColors = Array.isArray(colors) ? colors : colors.split(' ');
        }
      }

      const radianAngle = (gradientAngle * Math.PI) / 180;
      const innerRadius = (size + borderWidth * 2) / 2 - borderWidth; // Adjust for inward border

      const x0 = (size + borderWidth * 2) / 2 + innerRadius * Math.cos(radianAngle - Math.PI / 2);
      const y0 = (size + borderWidth * 2) / 2 + innerRadius * Math.sin(radianAngle - Math.PI / 2);
      const x1 = (size + borderWidth * 2) / 2 + innerRadius * Math.cos(radianAngle + Math.PI / 2);
      const y1 = (size + borderWidth * 2) / 2 + innerRadius * Math.sin(radianAngle + Math.PI / 2);

      const gradient = offScreenCtx.createLinearGradient(x0, y0, x1, y1);

      gradientColors.forEach((color, index) => {
        const offset = index / (gradientColors.length - 1);
        gradient.addColorStop(offset, color);
      });

      offScreenCtx.strokeStyle = gradient;
    } else {
      offScreenCtx.strokeStyle = borderColor || 'transparent';
    }

    offScreenCtx.lineWidth = borderWidth; // Set the border width
    offScreenCtx.stroke();

    offScreenCtx.restore();

    // Store the off-screen canvas in cache
    cache.elements[cacheKey] = offScreenCanvas;

    // Draw the cached image on the main canvas
    this.ctx.drawImage(offScreenCanvas, posX - borderWidth, posY - borderWidth);

    return { x: posX - borderWidth, y: posY - borderWidth, width: size + borderWidth * 2, height: size + borderWidth * 2, size, shape: 'triangle' };
  }
}

module.exports = TriangleDrawer;
