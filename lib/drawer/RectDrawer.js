const { parseBorderRadius, pixelParser, roundRect } = require("./CanvasHelper");
const { getCachedImage } = require("./CacheManager");

/**
 * Draws a rounded rectangle on a canvas context.
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {Object} options - Options for drawing the rectangle.
 * @param {number} options.x - The x-coordinate of the top-left corner.
 * @param {number} options.y - The y-coordinate of the top-left corner.
 * @param {number} options.width - The width of the rectangle.
 * @param {number} options.height - The height of the rectangle.
 * @param {string} [options.backgroundColor] - The background color of the rectangle.
 * @param {string} [options.backgroundImage] - The URL or path to the background image.
 * @param {Array|string|Object} [options.backgroundGradient] - The gradient for the background.
 * @param {string} [options.borderColor] - The border color of the rectangle.
 * @param {number} [options.borderWidth=1] - The width of the rectangle's border.
 * @param {Array|string|Object} [options.borderGradient] - The gradient for the border.
 * @param {string} [options.borderStyle='solid'] - The style of the border ('solid', 'dashed', 'dotted').
 * @param {number|string} [options.borderRadius=0] - The radius of the rectangle's corners.
 * @param {number} [options.opacity=1.0] - The opacity of the rectangle.
 * @param {object} [options.reference] - Reference object for positioning.
 * @returns {Promise<object>} Object with dimensions of the drawn rectangle { x, y, width, height }.
 */
async function RectDrawer(ctx, options = {}) {
  try {
    const {
      x, y, width, height, opacity = 1.0,
      backgroundColor, backgroundImage, backgroundGradient,
      borderColor, borderWidth = 1, borderGradient, borderStyle, borderRadius = 0, reference,
    } = pixelParser(options, ['backgroundImage', 'backgroundGradient', 'borderGradient', 'reference']);

    ctx.globalAlpha = opacity;

    const parsedBorderRadius = parseBorderRadius(borderRadius);

    let posX = x;
    let posY = y;

    const isCenterX = typeof x === 'string' && x.toLowerCase() === 'center';
    const isCenterY = typeof y === 'string' && y.toLowerCase() === 'center';

    if (isCenterX) posX = (ctx.canvas.width - width) / 2;
    if (isCenterY) posY = (ctx.canvas.height - height) / 2;

    if (reference && (isCenterX || isCenterY)) {
      if (isCenterX && reference.x !== undefined) {
        posX = reference.x + ((reference.width || reference.radius || 0) - width) / 2;
      }
      if (isCenterY && reference.y !== undefined) {
        posY = reference.y + ((reference.height || reference.radius || 0) - height) / 2;
      }
    }
    
    // Save current context state
    ctx.save();

    // Draw background image if provided
    if (backgroundImage) {
      const image = await getCachedImage(backgroundImage);

      ctx.save();
      roundRect(ctx, posX, posY, width, height, parsedBorderRadius);
      ctx.clip();
      ctx.drawImage(image, posX, posY, width, height);
      ctx.restore();
    }

    // Draw background color or background gradient if provided
    if (backgroundColor || backgroundGradient) {
      if (backgroundGradient) {
        let gradientColors;
        let gradientAngle = 0; // Default angle

        if (Array.isArray(backgroundGradient)) {
          gradientColors = backgroundGradient;
        } else if (typeof backgroundGradient === 'string') {
          gradientColors = backgroundGradient.split(' ');
        } else {
          const { angle = 0, stops, colors } = backgroundGradient;
          gradientAngle = angle;
          if (stops) {
            gradientColors = stops.map(stop => stop.color);
          } else if (colors) {
            gradientColors = Array.isArray(colors) ? colors : colors.split(' ');
          }
        }

        const radianAngle = (gradientAngle * Math.PI) / 180;
        const x0 = posX + (width / 2) * Math.cos(radianAngle - Math.PI / 2);
        const y0 = posY + (height / 2) * Math.sin(radianAngle - Math.PI / 2);
        const x1 = posX + (width / 2) * Math.cos(radianAngle + Math.PI / 2);
        const y1 = posY + (height / 2) * Math.sin(radianAngle + Math.PI / 2);

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });

        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = backgroundColor;
      }

      roundRect(ctx, posX, posY, width, height, parsedBorderRadius);
      ctx.fill();
    }

    // Draw border if provided
    if (borderColor || borderGradient) {
      if (borderGradient) {
        let gradientColors;
        let gradientAngle = 0; // Default angle

        if (Array.isArray(borderGradient)) {
          gradientColors = borderGradient;
        } else if (typeof borderGradient === 'string') {
          gradientColors = borderGradient.split(' ');
        } else {
          const { angle = 0, stops, colors } = borderGradient;
          gradientAngle = angle;
          if (stops) {
            gradientColors = stops.map(stop => stop.color);
          } else if (colors) {
            gradientColors = Array.isArray(colors) ? colors : colors.split(' ');
          }
        }

        const radianAngle = (gradientAngle * Math.PI) / 180;
        const x0 = posX + (width / 2) * Math.cos(radianAngle - Math.PI / 2);
        const y0 = posY + (height / 2) * Math.sin(radianAngle - Math.PI / 2);
        const x1 = posX + (width / 2) * Math.cos(radianAngle + Math.PI / 2);
        const y1 = posY + (height / 2) * Math.sin(radianAngle + Math.PI / 2);

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });

        ctx.strokeStyle = gradient;
      } else {
        ctx.strokeStyle = borderColor;
      }

      ctx.lineWidth = borderWidth || 1;

      if (borderStyle === 'dashed') {
        ctx.setLineDash([5, 3]);
      } else if (borderStyle === 'dotted') {
        ctx.setLineDash([2, 2]);
      } else {
        ctx.setLineDash([]);
      }

      roundRect(ctx, posX, posY, width, height, parsedBorderRadius);
      ctx.stroke();
    }

    // Restore context state
    ctx.restore();

    return { x: posX, y: posY, width, height }
  } catch (error) {
    console.error('[ERROR] Drawing rectangle:', error.message);
    throw error;
  }
}

module.exports = RectDrawer;