const { pxToNumber, pixelParser } = require("./CanvasHelper");
const { cache } = require("./CacheManager");
const { createCanvas } = require("@napi-rs/canvas");

class LineDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  /**
   * Draws a line on the canvas.
   * @param {Object} options - Options for drawing the line.
   * @param {number} options.startX - Starting horizontal position of the line.
   * @param {number} options.startY - Starting vertical position of the line.
   * @param {number} options.endX - Ending horizontal position of the line.
   * @param {number} options.endY - Ending vertical position of the line.
   * @param {number} [options.lineWidth=1] - Width of the line.
   * @param {string} [options.lineColor='black'] - Color of the line.
   * @param {string} [options.lineCap='butt'] - Style of the line's end caps ('butt', 'round', 'square').
   * @returns {Object} Object containing the line's details.
   */
  async drawLine(options = {}) {
    const { startX, startY, endX, endY, lineWidth = 1, lineColor = 'black', lineCap = 'butt' } = pixelParser(options);

    const startPosX = pxToNumber(startX);
    const startPosY = pxToNumber(startY);
    const endPosX = pxToNumber(endX);
    const endPosY = pxToNumber(endY);

    const cacheKey = JSON.stringify({ startX: startPosX, startY: startPosY, endX: endPosX, endY: endPosY, lineWidth, lineColor, lineCap });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], startPosX - lineWidth, startPosY - lineWidth); // Draw at (startPosX - lineWidth, startPosY - lineWidth)
      return { startX: startPosX, startY: startPosY, endX: endPosX, endY: endPosY, lineWidth, lineColor, lineCap };
    }

    // Calculate the dimensions of the canvas for the line
    const deltaX = Math.abs(endPosX - startPosX);
    const deltaY = Math.abs(endPosY - startPosY);
    const divWidth = deltaX + lineWidth * 2;
    const divHeight = deltaY + lineWidth * 2;

    // Create off-screen canvas for drawing the line
    const offScreenCanvas = createCanvas(divWidth, divHeight);
    const offScreenCtx = offScreenCanvas.getContext('2d');

    // Draw the line on the off-screen canvas
    offScreenCtx.lineWidth = lineWidth;
    offScreenCtx.strokeStyle = lineColor;
    offScreenCtx.lineCap = lineCap;
    offScreenCtx.beginPath();
    offScreenCtx.moveTo(lineWidth, lineWidth); // Start from (lineWidth, lineWidth) to offset for centering
    offScreenCtx.lineTo(deltaX + lineWidth, deltaY + lineWidth); // Draw line to (deltaX + lineWidth, deltaY + lineWidth)
    offScreenCtx.stroke();

    // Store the off-screen canvas in cache
    cache.elements[cacheKey] = offScreenCanvas;

    // Draw the cached image on the main canvas
    this.ctx.drawImage(offScreenCanvas, startPosX - lineWidth, startPosY - lineWidth); // Draw at (startPosX - lineWidth, startPosY - lineWidth)

    return { startX: startPosX, startY: startPosY, endX: endPosX, endY: endPosY, lineWidth, lineColor, lineCap };
  }
}

module.exports = LineDrawer;
