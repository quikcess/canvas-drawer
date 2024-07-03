const { createCanvas } = require("@napi-rs/canvas");
const { calculatePosition, pixelParser } = require("./CanvasHelper");
const { getCachedImage, cache } = require("./CacheManager");

class CircleDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  /**
   * Draws a circle on the canvas.
   * @param {object} options - Options for drawing the circle.
   * @param {string|number} options.x - X-coordinate of the circle's center.
   * @param {string|number} options.y - Y-coordinate of the circle's center.
   * @param {string|number} options.radius - Radius of the circle.
   * @param {object} [options.reference] - Reference object for positioning.
   * @param {string} [options.backgroundColor] - Background color of the circle.
   * @param {string} [options.backgroundImage] - URL or path to the background image of the circle.
   * @param {object|string|array} [options.backgroundGradient] - Background gradient of the circle.
   * @param {string} [options.borderColor] - Color of the circle's border.
   * @param {object|string|array} [options.borderGradient] - Color gradient of the circle's border.
   * @param {string|number} [options.borderWidth] - Width of the circle's border.
   * @param {object} [lastReference] - Last reference object for positioning.
   * @returns {Promise<object>} Object with dimensions of the drawn circle { x, y, width, height }.
   */
  async drawCircle(options = {}, lastReference = null) {
    const { x, y, radius, reference, backgroundColor, backgroundImage, backgroundGradient, borderColor, borderGradient, borderWidth } = pixelParser(options);
    const { posX, posY, circleRadius } = calculatePosition({ ctx: this.ctx, x, y, radius, reference, lastReference, shape: "circle" });

    const cacheKey = JSON.stringify({ x: posX, y: posY, radius: circleRadius, backgroundColor, backgroundImage, backgroundGradient, borderColor, borderGradient, borderWidth, shape: "circle" });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], posX - circleRadius, posY - circleRadius, circleRadius * 2, circleRadius * 2);
      return { x: posX, y: posY, width: circleRadius * 2, height: circleRadius * 2, radius: circleRadius, shape: "circle" };
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
    
    // Draw background color or gradient
    if ((backgroundColor && backgroundColor !== 'transparent') || backgroundGradient) {
      if (backgroundColor) {
        offScreenCtx.fillStyle = backgroundColor;
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
        const gradient = offScreenCtx.createLinearGradient(x0, y0, x1, y1);

        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });

        offScreenCtx.fillStyle = gradient;
      }

      offScreenCtx.beginPath();
      offScreenCtx.arc(circleRadius, circleRadius, circleRadius, 0, Math.PI * 2);
      offScreenCtx.closePath();
      offScreenCtx.fill();
    }

    // Draw circle border if borderColor and borderWidth are specified
    if ((borderColor || borderGradient) && borderWidth) {
      if (borderColor) {
        offScreenCtx.strokeStyle = borderColor;
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
        const gradient = offScreenCtx.createLinearGradient(x0, y0, x1, y1);
    
        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });
    
        offScreenCtx.strokeStyle = gradient;
      }

      const parsedBorderWidth = parseFloat(borderWidth);

      if (!isNaN(parsedBorderWidth)) {
        offScreenCtx.lineWidth = parsedBorderWidth;
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
   
    return { x: posX - circleRadius, y: posY - circleRadius, width: circleRadius * 2, height: circleRadius * 2, shape: "circle" };
  }
}

module.exports = CircleDrawer;