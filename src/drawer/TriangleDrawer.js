const { pxToNumber } = require("./CanvasHelper");
const { cache, getCachedImage } = require("./CacheManager");
const { createCanvas } = require("@napi-rs/canvas");

class TrianguleDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  /**
   * Draws a triangle on the canvas.
   * @param {Object} options - Options for drawing the triangle.
   * @param {number} options.x - Horizontal position of the triangle.
   * @param {number} options.y - Vertical position of the triangle.
   * @param {number} options.width - Width of the triangle base.
   * @param {number} options.height - Height of the triangle.
   * @param {Object} [options.reference] - Reference object for positioning.
   * @param {string} [options.backgroundColor='transparent'] - Background color of the triangle.
   * @param {string} options.backgroundImage - URL or path to the background image of the rectangle.
   * @param {string} [options.borderColor] - Border color of the triangle.
   * @param {number} [options.borderWidth] - Border width of the triangle.
   */
  async drawTriangle(options = {}) {
    const { x, y, width, height, ...rest } = options;
    const posX = pxToNumber(x);
    const posY = pxToNumber(y);
    const divWidth = pxToNumber(width);
    const divHeight = pxToNumber(height);

    const cacheKey = JSON.stringify({ x: posX, y: posY, width: divWidth, height: divHeight, ...rest });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], posX, posY); // Draw cached image directly
      return;
    }

    // Create off-screen canvas for drawing the triangle
    const offScreenCanvas = createCanvas(divWidth, divHeight);
    const offScreenCtx = offScreenCanvas.getContext('2d');

    offScreenCtx.save();

    // Draw triangle background
    if (rest.backgroundColor && rest.backgroundColor !== 'transparent') {
      offScreenCtx.fillStyle = rest.backgroundColor;
      offScreenCtx.beginPath();
      offScreenCtx.moveTo(0, divHeight); // Move to the starting point
      offScreenCtx.lineTo(divWidth / 2, 0); // Line to the top of the triangle
      offScreenCtx.lineTo(divWidth, divHeight); // Line back to the starting point
      offScreenCtx.closePath();
      offScreenCtx.fill();
    }

    // Draw background image if provided
    if (rest.backgroundImage) {
      const image = await getCachedImage(rest.backgroundImage);

      // Create a clipping mask to ensure the image stays within the triangle
      offScreenCtx.beginPath();
      offScreenCtx.moveTo(0, divHeight);
      offScreenCtx.lineTo(divWidth / 2, 0);
      offScreenCtx.lineTo(divWidth, divHeight);
      offScreenCtx.closePath();
      offScreenCtx.clip();

      // Calculate scale and position to center the image
      const scale = Math.max(divWidth / image.width, divHeight / image.height);
      const imageWidth = image.width * scale;
      const imageHeight = image.height * scale;
      const imageX = (divWidth - imageWidth) / 2;
      const imageY = (divHeight - imageHeight) / 2;

      // Draw the image
      offScreenCtx.drawImage(image, imageX, imageY, imageWidth, imageHeight);
    }

    // Draw triangle border
    if (rest.borderColor && rest.borderWidth) {
      offScreenCtx.strokeStyle = rest.borderColor;
      const parsedBorderWidth = parseFloat(rest.borderWidth);

      if (!isNaN(parsedBorderWidth)) {
        offScreenCtx.lineWidth = parsedBorderWidth;
      } else {
        console.warn('Invalid borderWidth:', rest.borderWidth);
        offScreenCtx.lineWidth = 1;
      }

      offScreenCtx.beginPath();
      offScreenCtx.moveTo(0, divHeight);
      offScreenCtx.lineTo(divWidth / 2, 0);
      offScreenCtx.lineTo(divWidth, divHeight);
      offScreenCtx.closePath();
      offScreenCtx.stroke();
    }

    offScreenCtx.restore();

    // Store the off-screen canvas in cache
    cache.elements[cacheKey] = offScreenCanvas;

    // Draw the cached image on the main canvas
    this.ctx.drawImage(offScreenCanvas, posX, posY);

    return { x: posX, y: posY, width: divWidth, height: divHeight };
  }
}

module.exports = TrianguleDrawer;