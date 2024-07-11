const { pixelParser } = require('./CanvasHelper');

/**
 * Draws text on a canvas context.
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {Object} options - Options for drawing the text.
 * @param {string} options.text - The text to draw.
 * @param {number|string} options.x - The x-coordinate of the text or 'center' to center horizontally.
 * @param {number|string} options.y - The y-coordinate of the text or 'center' to center vertically.
 * @param {string} [options.font='30px sans-serif'] - The font style for the text.
 * @param {string} [options.color='#000000'] - The color of the text.
 * @param {string} [options.align='start'] - The text alignment ('start', 'end', 'left', 'right', 'center').
 * @param {string} [options.baseline='alphabetic'] - The text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom').
 * @param {object} [options.reference] - Reference object for positioning.
 * @returns {Object} The calculated positions and applied styles.
 */
const drawText = async (ctx, options = {}) => {
  try {
    const {
      text, x, y,
      font = '30px sans-serif', color = '#000000',
      align = 'start', baseline = 'alphabetic', reference,
    } = pixelParser(options, ['text', 'font', 'reference']);

    const textStr = String(text);

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    // Measure text width and height for centering
    const textMetrics = ctx.measureText(textStr);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    let posX = x;
    let posY = typeof y === 'number' ? y + textMetrics.actualBoundingBoxAscent : textMetrics.actualBoundingBoxAscent;

    const isCenterX = typeof x === 'string' && x.toLowerCase() === 'center';
    const isCenterY = typeof y === 'string' && y.toLowerCase() === 'center';

    if (isCenterX) posX = (ctx.canvas.width - textWidth) / 2;
    if (isCenterY) posY = (ctx.canvas.height + textHeight) / 2 - textMetrics.actualBoundingBoxDescent;

    if (reference && (isCenterX || isCenterY)) {
      if (isCenterX && reference.x !== undefined) {
        posX = reference.x + ((reference.width || reference.radius || 0) - textWidth) / 2;
      }
      if (isCenterY && reference.y !== undefined) {
        posY = reference.y + ((reference.height || reference.radius || 0) + textHeight) / 2 - textMetrics.actualBoundingBoxDescent;
      }
    }
    
    // Calculate the centered position if 'center' is provided
    ctx.fillText(textStr, posX, posY);

    return { x: posX, y: posY, textStr, width: textWidth, height: textHeight }

  } catch (error) {
    console.error('[ERROR] Drawing text:', error.message);
    throw error;
  }
};

module.exports = drawText;