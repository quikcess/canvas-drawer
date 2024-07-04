const { createCanvas } = require('@napi-rs/canvas');
const { pixelParser } = require('./CanvasHelper');
const { cache } = require('./CacheManager');

class TextDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  /**
   * Draws text on the canvas.
   * @param {string} text - The text to draw.
   * @param {number} x - The x-coordinate of the text.
   * @param {number} y - The y-coordinate of the text.
   * @param {Object} [options] - Options for drawing the text.
   * @param {string} [options.font='30px sans-serif'] - Font style for the text.
   * @param {string} [options.color='#000000'] - Color of the text.
   * @param {string} [options.align='start'] - Text alignment ('start', 'end', 'left', 'right', 'center').
   * @param {string} [options.baseline='alphabetic'] - Text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom').
   */
  async drawText(options = {}) {
    const { text, x, y, font = '30px sans-serif', color = '#000000', align = 'start', baseline = 'alphabetic' } = pixelParser(options);

    const cacheKey = JSON.stringify({ font, color, align, baseline, shape: "text" });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], x, y);
      return { x, y, font, color, align, baseline, shape: "text" };
    }

    this.ctx.save();

    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;

    // Measure text width and height for centering
    const textMetrics = this.ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    let posX=x;
    let posY=y;

    const isCenterX = typeof x === 'string' && x.toLowerCase() === 'center';
    const isCenterY = typeof y === 'string' && y.toLowerCase() === 'center';

    // Calculate the centered position if 'center' is provided
    if (isCenterX) posX = (this.canvas.width - textWidth) / 2;
    if (isCenterY) posY = (this.canvas.height + textHeight) / 2 - textMetrics.actualBoundingBoxDescent;

    this.ctx.fillText(text, posX, posY);

    this.ctx.restore();

    // Cache the drawn text
    const offScreenCanvas = createCanvas(textWidth, textHeight);
    const offScreenCtx = offScreenCanvas.getContext('2d');
    offScreenCtx.font = font;
    offScreenCtx.fillStyle = color;
    offScreenCtx.textAlign = align;
    offScreenCtx.textBaseline = baseline;
    offScreenCtx.fillText(text, 0, textMetrics.actualBoundingBoxAscent);

    cache.elements[cacheKey] = offScreenCanvas;

    return { x, y, font, color, align, baseline, shape: "text" };
  }
}

module.exports = TextDrawer;