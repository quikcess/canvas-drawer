const { createCanvas } = require("@napi-rs/canvas");
const { calculatePosition, roundRect } = require("./CanvasHelper");
const { getCachedImage, cache } = require("./CacheManager");

class RectDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  /**
   * Draws a rectangle on the canvas with optional background image and border.
   * @param {Object} options - Options for drawing the rectangle.
   * @param {number} options.x - X-coordinate of the rectangle's top-left corner.
   * @param {number} options.y - Y-coordinate of the rectangle's top-left corner.
   * @param {number} options.width - Width of the rectangle.
   * @param {number} options.height - Height of the rectangle.
   * @param {Object} options.reference - Reference object for positioning.
   * @param {string} options.backgroundColor - Background color of the rectangle.
   * @param {string} options.backgroundImage - URL or path to the background image of the rectangle.
   * @param {string} options.borderColor - Color of the rectangle's border.
   * @param {string} options.borderWidth - Width of the rectangle's border.
   * @param {string} options.borderStyle - Style of the rectangle's border ('dashed', 'dotted', etc.).
   * @param {number} options.borderRadius - Radius of the rectangle's corners.
   * @param {Object} lastReference - Last reference object for positioning.
   * @returns {Promise<Object>} Object with dimensions of the drawn rectangle { x, y, width, height }.
   */
  async drawRect(options = {}, lastReference = null) {
    const { x, y, width, height, reference, borderRadius = 0, backgroundColor, backgroundImage, borderColor, borderWidth, borderStyle } = options;
    const { posX, posY, divWidth, divHeight } = calculatePosition({ ctx: this.ctx, x, y, width, height, reference, lastReference });

    const cacheKey = JSON.stringify({ x: posX, y: posY, width: divWidth, height: divHeight, borderRadius, backgroundColor, backgroundImage, borderColor, borderWidth, borderStyle });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], posX, posY, divWidth, divHeight);
      return { x: posX, y: posY, width: divWidth, height: divHeight };
    }

    // Canvas off-screen para desenhar o elemento
    const offScreenCanvas = createCanvas(divWidth, divHeight);
    const offScreenCtx = offScreenCanvas.getContext('2d');

    offScreenCtx.save();

    // Draw background image if provided
    if (backgroundImage) {
      const image = await getCachedImage(backgroundImage);

      // Create a clipping mask to ensure the image stays within the rounded rectangle
      offScreenCtx.beginPath();
      roundRect(offScreenCtx, 0, 0, divWidth, divHeight, borderRadius);
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
    
    // Draw background color if provided and not transparent
    if (backgroundColor && backgroundColor !== 'transparent') {
      offScreenCtx.fillStyle = backgroundColor;
      offScreenCtx.beginPath();
      roundRect(offScreenCtx, 0, 0, divWidth, divHeight, borderRadius);
      offScreenCtx.closePath();
      offScreenCtx.fill();
    }

    // Draw rectangle border if borderColor and borderWidth are specified
    if (borderColor && borderWidth) {
      offScreenCtx.strokeStyle = borderColor;
      const parsedBorderWidth = parseFloat(borderWidth);

      if (!isNaN(parsedBorderWidth)) {
        offScreenCtx.lineWidth = parsedBorderWidth;
      } else {
        console.warn('Invalid borderWidth:', borderWidth);
        offScreenCtx.lineWidth = 1;
      }

      switch (borderStyle) {
        case 'dashed':
          offScreenCtx.setLineDash([6, 4]);
          break;
        case 'dotted':
          offScreenCtx.setLineDash([2, 2]);
          break;
        default:
          offScreenCtx.setLineDash([]);
          break;
      }

      offScreenCtx.beginPath();
      roundRect(offScreenCtx, 0, 0, divWidth, divHeight, borderRadius);
      offScreenCtx.closePath();
      offScreenCtx.stroke();
    }

    offScreenCtx.restore();

    cache.elements[cacheKey] = offScreenCanvas;

    this.ctx.drawImage(offScreenCanvas, posX, posY, divWidth, divHeight);

    return { x: posX, y: posY, width: divWidth, height: divHeight };
  }
}

module.exports = RectDrawer;