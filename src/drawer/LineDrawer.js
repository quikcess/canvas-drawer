const { pxToNumber, pixelParser, calculatePosition } = require("./CanvasHelper");
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
   * @param {number|string} options.startX - Starting horizontal position of the line.
   * @param {number|string} options.startY - Starting vertical position of the line.
   * @param {number|string} options.endX - Ending horizontal position of the line.
   * @param {number|string} options.endY - Ending vertical position of the line.
   * @param {number} [options.lineWidth=1] - Width of the line.
   * @param {string} [options.lineColor='black'] - Color of the line.
   * @param {string} [options.lineCap='butt'] - Style of the line's end caps ('butt', 'round', 'square').
   * @param {object} [lastReference] - Last reference object for positioning.
   * @returns {Object} Object containing the line's details.
   */
  async drawLine(options = {}, lastReference = null) {
    const { startX, startY, endX, endY, lineWidth = 1, lineColor = 'black', lineCap = 'butt', reference } = pixelParser(options);

    // Calculate the start and end positions using calculatePosition
    const startPosition = calculatePosition({ ctx: this.ctx, shape: 'line', x: startX, y: startY, lineWidth, reference, lastReference });
    const endPosition = calculatePosition({ ctx: this.ctx, shape: 'line', x: endX, y: endY, lineWidth, reference, lastReference });

    const { posX: startPosX, posY: startPosY } = startPosition;
    const { posX: endPosX, posY: endPosY } = endPosition;

    const cacheKey = JSON.stringify({ startX: startPosX, startY: startPosY, endX: endPosX, endY: endPosY, lineWidth, lineColor, lineCap });
    if (cache.elements[cacheKey]) {
      this.ctx.drawImage(cache.elements[cacheKey], startPosX - lineWidth, startPosY - lineWidth); // Draw at (startPosX - lineWidth, startPosY - lineWidth)
      return { startX: startPosX, startY: startPosY, endX: endPosX, endY: endPosY, lineWidth, lineColor, lineCap, x: startPosX, y: startPosY, width: endPosX - startPosX, height: endPosY - startPosY };
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

    return { startX: startPosX, startY: startPosY, endX: endPosX, endY: endPosY, lineWidth, lineColor, lineCap, x: startPosX, y: startPosY, width: endPosX - startPosX, height: endPosY - startPosY };
  }
}

module.exports = LineDrawer;
