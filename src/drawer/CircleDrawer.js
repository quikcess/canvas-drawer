const { createCanvas } = require("@napi-rs/canvas");
const { calculatePosition } = require("./CanvasHelper");
const { getCachedImage, cache } = require("./CacheManager");

class CircleDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  /**
   * Draws a circle on the canvas.
   * @param {Object} options - Options for drawing the circle.
   * @param {number} options.x - X-coordinate of the circle's center.
   * @param {number} options.y - Y-coordinate of the circle's center.
   * @param {number} options.radius - Radius of the circle.
   * @param {Object} options.reference - Reference object for positioning.
   * @param {string} options.backgroundColor - Background color of the circle.
   * @param {string} options.backgroundImage - URL or path to the background image of the circle.
   * @param {string} options.borderColor - Color of the circle's border.
   * @param {string} options.borderWidth - Width of the circle's border.
   * @param {Object} lastReference - Last reference object for positioning.
   * @returns {Promise<Object>} Object with dimensions of the drawn circle { x, y, width, height }.
   */
  async drawCircle(options = {}, lastReference = null) {
    const { x, y, radius, reference, backgroundColor, backgroundImage, borderColor, borderWidth } = options;
    const { posX, posY, circleRadius } = calculatePosition({ ctx: this.ctx, x, y, radius, reference, lastReference });

    const cacheKey = JSON.stringify({ x: posX, y: posY, radius: circleRadius, backgroundColor, backgroundImage, borderColor, borderWidth });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], posX - circleRadius, posY - circleRadius, circleRadius * 2, circleRadius * 2);
      return { x: posX, y: posY, width: circleRadius * 2, height: circleRadius * 2 };
    }

    // Canvas off-screen para desenhar o elemento
    const offScreenCanvas = createCanvas(circleRadius * 2, circleRadius * 2);
    const offScreenCtx = offScreenCanvas.getContext('2d');

    offScreenCtx.save();

    // Draw background image if provided
    if (backgroundImage) {
      const image = await getCachedImage(backgroundImage);

      // Create a clipping mask to ensure the image stays within the circle
      offScreenCtx.beginPath();
      offScreenCtx.arc(circleRadius, circleRadius, circleRadius, 0, Math.PI * 2);
      offScreenCtx.clip();
      
      // Calculate scale and position to center the image
      const scale = Math.max(circleRadius * 2 / image.width, circleRadius * 2 / image.height);
      const imageWidth = image.width * scale;
      const imageHeight = image.height * scale;
      const imageX = circleRadius - imageWidth / 2;
      const imageY = circleRadius - imageHeight / 2;

      // Draw the image
      offScreenCtx.drawImage(image, imageX, imageY, imageWidth, imageHeight);
    }
    
    // Draw background color or image
    if (backgroundColor && backgroundColor !== 'transparent') {
      offScreenCtx.fillStyle = backgroundColor;
      offScreenCtx.beginPath();
      offScreenCtx.arc(circleRadius, circleRadius, circleRadius, 0, Math.PI * 2);
      offScreenCtx.closePath();
      offScreenCtx.fill();
    }

    // Draw circle border if borderColor and borderWidth are specified
    if (borderColor && borderWidth) {
      offScreenCtx.strokeStyle = borderColor;
      const parsedBorderWidth = parseFloat(borderWidth);

      if (!isNaN(parsedBorderWidth)) {
        // Ensure the border width is an integer for smoother rendering
        offScreenCtx.lineWidth = Math.round(parsedBorderWidth);
      } else {
        console.warn('Invalid borderWidth:', borderWidth);
        offScreenCtx.lineWidth = 1;
      }

      offScreenCtx.beginPath();
      offScreenCtx.arc(circleRadius, circleRadius, circleRadius - offScreenCtx.lineWidth / 2, 0, Math.PI * 2);
      offScreenCtx.closePath();
      offScreenCtx.stroke();
    }

    offScreenCtx.restore();

    cache.elements[cacheKey] = offScreenCanvas;

    this.ctx.drawImage(offScreenCanvas, posX - circleRadius, posY - circleRadius, circleRadius * 2, circleRadius * 2);

    return { x: posX, y: posY, width: circleRadius * 2, height: circleRadius * 2 };
  }
}

module.exports = CircleDrawer;