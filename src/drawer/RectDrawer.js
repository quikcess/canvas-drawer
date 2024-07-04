const { createCanvas } = require("@napi-rs/canvas");
const { calculatePosition, roundRect, pixelParser } = require("./CanvasHelper");
const { getCachedImage, cache } = require("./CacheManager");

class RectDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  /**
   * Draws a rectangle on the canvas with optional background image, gradient, and border.
   * @param {object} options - Options for drawing the rectangle.
   * @param {number|string} options.x - X-coordinate of the rectangle's top-left corner.
   * @param {number|string} options.y - Y-coordinate of the rectangle's top-left corner.
   * @param {number|string} options.width - Width of the rectangle.
   * @param {number|string} options.height - Height of the rectangle.
   * @param {object} [options.reference] - Reference object for positioning.
   * @param {string} [options.backgroundColor] - Background color of the rectangle.
   * @param {string} [options.backgroundImage] - URL or path to the background image of the rectangle.
   * @param {object|string|array} [options.backgroundGradient] - Background gradient of the rectangle.
   * @param {string} [options.borderColor] - Color of the rectangle's border.
   * @param {object|string|array} [options.borderGradient] - Color gradient of the rectangle's border.
   * @param {string} [options.borderWidth] - Width of the rectangle's border.
   * @param {string} [options.borderStyle] - Style of the rectangle's border ('dashed', 'dotted', etc.).
   * @param {number|string|array} [options.borderRadius] - Radius of the rectangle's corners.
   * @param {object} [lastReference] - Last reference object for positioning.
   * @returns {Promise<object>} Object with dimensions of the drawn rectangle { x, y, width, height }.
   */
  async drawRect(options = {}, lastReference = null) {
    const { x, y, width, height, reference, borderRadius = 0, borderWidth, borderColor, borderGradient, borderStyle, backgroundColor, backgroundImage, backgroundGradient } = pixelParser(options);
    const { posX, posY, divWidth, divHeight } = calculatePosition({ ctx: this.ctx, shape: "rectangle", x, y, width, height, reference, lastReference });

    // Verificar sobreposição
    const cacheKey = JSON.stringify({ width: divWidth, height: divHeight, borderRadius, backgroundColor, backgroundImage, backgroundGradient, borderColor, borderWidth, borderStyle, shape: "rectangle" });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], posX, posY, divWidth, divHeight);
      return { x: posX, y: posY, width: divWidth, height: divHeight, shape: "rectangle" };
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
    
    // Draw backgroundColor/backgroundGradient if provided and not transparent
    if ((backgroundColor && backgroundColor !== 'transparent') || backgroundGradient) {
      if (backgroundColor) {
        offScreenCtx.fillStyle = backgroundColor;
      } else if (backgroundGradient) {
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
        const x0 = divWidth / 2 + (divWidth / 2) * Math.cos(radianAngle - Math.PI / 2);
        const y0 = divHeight / 2 + (divHeight / 2) * Math.sin(radianAngle - Math.PI / 2);
        const x1 = divWidth / 2 + (divWidth / 2) * Math.cos(radianAngle + Math.PI / 2);
        const y1 = divHeight / 2 + (divHeight / 2) * Math.sin(radianAngle + Math.PI / 2);
  
        const gradient = offScreenCtx.createLinearGradient(x0, y0, x1, y1);
  
        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });
  
        offScreenCtx.fillStyle = gradient;
      }
      
      offScreenCtx.beginPath();
      roundRect(offScreenCtx, 0, 0, divWidth, divHeight, borderRadius);
      offScreenCtx.closePath();
      offScreenCtx.fill();
    }

    // Draw rectangle border if borderColor/borderGradient and borderWidth are specified
    if ((borderColor || borderGradient) && borderWidth) {
      if (borderColor) {
        offScreenCtx.strokeStyle = borderColor;
      } else if (borderGradient) { // Gradient
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
        const x0 = divWidth / 2 + (divWidth / 2) * Math.cos(radianAngle - Math.PI / 2);
        const y0 = divHeight / 2 + (divHeight / 2) * Math.sin(radianAngle - Math.PI / 2);
        const x1 = divWidth / 2 + (divWidth / 2) * Math.cos(radianAngle + Math.PI / 2);
        const y1 = divHeight / 2 + (divHeight / 2) * Math.sin(radianAngle + Math.PI / 2);
  
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
      const halfBorderWidth = offScreenCtx.lineWidth / 2;
      const pathX = halfBorderWidth;
      const pathY = halfBorderWidth;
      const pathWidth = divWidth - offScreenCtx.lineWidth;
      const pathHeight = divHeight - offScreenCtx.lineWidth;

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

      const newBorderRadius = ['string', 'number'].includes(typeof borderRadius) ?
        String(borderRadius).split(" ").map(s => s != 0 ? s-(halfBorderWidth*1.5) : 0 ) :
      borderRadius.map(s => s != 0 ? s-(halfBorderWidth*1.5) : 0 )
      
      offScreenCtx.beginPath();
      roundRect(offScreenCtx, pathX, pathY, pathWidth, pathHeight, newBorderRadius);
      offScreenCtx.closePath();
      offScreenCtx.stroke();
    }

    offScreenCtx.restore();

    cache.elements[cacheKey] = offScreenCanvas;

    this.ctx.drawImage(offScreenCanvas, posX, posY, divWidth, divHeight);

    return { x: posX, y: posY, width: divWidth, height: divHeight, shape: "rectangle" };
  }
}

module.exports = RectDrawer;