const { getCachedImage } = require("./CacheManager");
const { pixelParser } = require("./CanvasHelper");

/**
 * Draws a circle on a specified canvas context.
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {object} options - Options for drawing the circle.
 * @param {string|number} options.x - X-coordinate of the circle's center.
 * @param {string|number} options.y - Y-coordinate of the circle's center.
 * @param {string|number} options.radius - Radius of the circle.
 * @param {string} [options.backgroundColor] - Background color of the circle.
 * @param {string} [options.backgroundImage] - URL or path to the background image of the circle.
 * @param {object|string|array} [options.backgroundGradient] - Background gradient of the circle.
 * @param {string} [options.borderColor] - Color of the circle's border.
 * @param {object|string|array} [options.borderGradient] - Color gradient of the circle's border.
 * @param {string|number} [options.borderWidth] - Width of the circle's border.
 * @param {object} [options.reference] - Reference object for positioning.
 * @returns {Promise<object>} Object with dimensions of the drawn circle { x, y, width, height, radius }.
 */
async function CircleDrawer(ctx, options = {}) {
  try {
    const {
      x,  y, radius, backgroundColor,
      backgroundImage, backgroundGradient,
      borderColor, borderGradient, borderWidth = 1, reference,
    } = pixelParser(options, ['backgroundImage', 'backgroundGradient', 'borderGradient', 'reference']);

    const isCenterX = typeof x === 'string' && x.toLowerCase() === 'center';
    const isCenterY = typeof y === 'string' && y.toLowerCase() === 'center';

    let circleRadius = radius;
    let posX = x + circleRadius / 2;
    let posY = y + circleRadius / 2;

    if (isCenterX) posX = ctx.canvas.width / 2;
    if (isCenterY) posY = ctx.canvas.height / 2;

    if (reference && (isCenterX || isCenterY)) {
      if (isCenterX && reference.x !== undefined) {
        posX = reference.x + ((reference.width || reference.radius || 0) / 2);
      }
      if (isCenterY && reference.y !== undefined) {
        posY = reference.y + ((reference.height || reference.radius || 0) / 2);
      }
    }

    circleRadius = radius / 2;

    ctx.save();

    // Draw background image if provided
    if (backgroundImage) {
      const image = await getCachedImage(backgroundImage);

      ctx.beginPath();
      ctx.arc(posX, posY, circleRadius, 0, Math.PI * 2);
      ctx.clip();

      // Calculate scale and position to center the image
      const scale = Math.max(circleRadius * 2 / image.width, circleRadius * 2 / image.height);
      const imageWidth = image.width * scale;
      const imageHeight = image.height * scale;
      const imageX = posX - imageWidth / 2;
      const imageY = posY - imageHeight / 2;

      // Draw the image
      ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);
    }
    
    // Draw background color or gradient
    if ((backgroundColor && backgroundColor !== 'transparent') || backgroundGradient) {
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
      } else if (backgroundGradient) {
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

        // Calculate gradient start and end points
        const radianAngle = (gradientAngle * Math.PI) / 180;
        const x0 = circleRadius + (circleRadius * Math.cos(radianAngle - Math.PI / 2));
        const y0 = circleRadius + (circleRadius * Math.sin(radianAngle - Math.PI / 2));
        const x1 = circleRadius + (circleRadius * Math.cos(radianAngle + Math.PI / 2));
        const y1 = circleRadius + (circleRadius * Math.sin(radianAngle + Math.PI / 2));

        // Create gradient
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });

        ctx.fillStyle = gradient;
      }

      ctx.beginPath();
      ctx.arc(posX, posY, circleRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    // Draw circle border if borderColor and borderWidth are specified
    if ((borderColor || borderGradient) && borderWidth) {
      if (borderColor) {
        ctx.strokeStyle = borderColor;
      } else if (borderGradient) {
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
    
        // Calculate gradient start and end points
        const radianAngle = (gradientAngle * Math.PI) / 180;
        const x0 = circleRadius + (circleRadius * Math.cos(radianAngle - Math.PI / 2));
        const y0 = circleRadius + (circleRadius * Math.sin(radianAngle - Math.PI / 2));
        const x1 = circleRadius + (circleRadius * Math.cos(radianAngle + Math.PI / 2));
        const y1 = circleRadius + (circleRadius * Math.sin(radianAngle + Math.PI / 2));
    
        // Create gradient
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    
        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });
    
        ctx.strokeStyle = gradient;
      }

      ctx.lineWidth = parseFloat(borderWidth) || 1;

      ctx.beginPath();
      ctx.arc(posX, posY, circleRadius - ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();

    return { x: posX - circleRadius, y: posY - circleRadius, width: circleRadius * 2, height: circleRadius * 2, radius: circleRadius };
  } catch (error) {
    console.error('[ERROR] Drawing circle:', error.message);
    throw error;
  }
}

module.exports = CircleDrawer;