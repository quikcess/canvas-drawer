const { pixelParser } = require('./CanvasHelper');

/**
 * Draws text on a canvas context.
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {Object} options - Options for drawing the text.
 * @param {string} options.text - The text to draw.
 * @param {number|string} options.x - The x-coordinate of the text or 'center' to center horizontally.
 * @param {number|string} options.y - The y-coordinate of the text or 'center' to center vertically.
 * @param {string} [options.font='30px sans-serif'] - The default font style for the text.
 * @param {string} [options.color='#000000'] - The default color of the text.
 * @param {string} [options.align='start'] - The text alignment ('start', 'end', 'left', 'right', 'center').
 * @param {string} [options.baseline='alphabetic'] - The text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom').
 * @param {Array<Object>} [options.segments] - Array of text segments with different styles.
 * @param {number} [options.opacity=1.0] - The opacity of the text.
 * @param {object} [options.reference] - Reference object for positioning.
 * @returns {Object} The calculated positions and applied styles.
 */
const drawText = async (ctx, options = {}) => {
  try {
    const {
      text, x, y,
      font = '30px sans-serif', color = '#000000',
      align = 'start', baseline = 'alphabetic',
      segments = [], reference, opacity = 1.0,
    } = pixelParser(options, ['text', 'font', 'segments', 'reference']);

    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.globalAlpha = opacity;

    // Measure the total text width for centering
    ctx.font = font;
    const totalText = segments.length > 0 ? segments.map(seg => seg.text).join('') : text;
    const defaultTextMetrics = ctx.measureText(totalText);
    const defaultTextHeight = defaultTextMetrics.actualBoundingBoxAscent + defaultTextMetrics.actualBoundingBoxDescent;

    let posX = x;
    let posY = typeof y === 'number' ? y + defaultTextMetrics.actualBoundingBoxAscent : defaultTextMetrics.actualBoundingBoxAscent;

    const isCenterX = typeof x === 'string' && x.toLowerCase() === 'center';
    const isCenterY = typeof y === 'string' && y.toLowerCase() === 'center';

    // Draw the text segments with different styles and calculate the total width
    let totalTextWidth = 0;
    for (const segment of segments) {
      ctx.font = segment.font || font;
      totalTextWidth += ctx.measureText(segment.text).width;
    }

    if (segments.length === 0) {
      totalTextWidth = defaultTextMetrics.width;
    }

    if (isCenterX) posX = (ctx.canvas.width - totalTextWidth) / 2;
    if (isCenterY) posY = (ctx.canvas.height + defaultTextHeight) / 2 - defaultTextMetrics.actualBoundingBoxDescent;

    if (reference && (isCenterX || isCenterY)) {
      if (isCenterX && reference.x !== undefined) {
        posX = reference.x + ((reference.width || reference.radius || 0) - totalTextWidth) / 2;
      }
      if (isCenterY && reference.y !== undefined) {
        posY = reference.y + ((reference.height || reference.radius || 0) + defaultTextHeight) / 2 - defaultTextMetrics.actualBoundingBoxDescent;
      }
    }

    // Draw the text segments with different styles
    let currentX = posX;
    for (const segment of segments) {
      ctx.font = segment.font || font;
      ctx.fillStyle = segment.color || color;
      ctx.fillText(segment.text, currentX, posY);
      currentX += ctx.measureText(segment.text).width;
    }

    // Draw the default text if no segments are provided
    if (segments.length === 0) {
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.fillText(totalText, posX, posY);
    }

    // return { x: posX, y: posY-defaultTextHeight/2, textStr: totalText, width: totalTextWidth }
    return { x: posX, y: posY-defaultTextHeight/2, textStr: totalText, width: totalTextWidth }

  } catch (error) {
    console.error('[ERROR] Drawing text:', error.message);
    throw error;
  }
};

module.exports = drawText;