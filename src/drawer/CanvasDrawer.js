const { AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');

const RectDrawer = require('./RectDrawer');
const CircleDrawer = require('./CircleDrawer');
const LineDrawer = require('./LineDrawer');
const TriangleDrawer = require('./TriangleDrawer');
const TextDrawer = require('./TextDrawer');

const { clearCache } = require("./CacheManager");
const { isValidMimeType } = require('./CanvasHelper');

class CanvasDrawer {
  constructor(width, height) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    
    this.rectDrawer = new RectDrawer(this.ctx);
    this.circleDrawer = new CircleDrawer(this.ctx);
    this.lineDrawer = new LineDrawer(this.ctx);
    this.triangleDrawer = new TriangleDrawer(this.ctx);
    this.textDrawer = new TextDrawer(this.ctx);

    this.lastReference = null;
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
  async drawRect(options = {}) {
    this.lastReference = await this.rectDrawer.drawRect(options, this.lastReference);
    return this.lastReference;
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
  async drawCircle(options = {}) {
    this.lastReference = await this.circleDrawer.drawCircle(options, this.lastReference);
    return this.lastReference;
  }

  /**
   * Draws a line on the canvas.
   * @param {object} options - Options for drawing the line.
   * @param {number} options.startX - Starting horizontal position of the line.
   * @param {number} options.startY - Starting vertical position of the line.
   * @param {number} options.endX - Ending horizontal position of the line.
   * @param {number} options.endY - Ending vertical position of the line.
   * @param {number} [options.lineWidth=1] - Width of the line.
   * @param {string} [options.lineColor='black'] - Color of the line.
   * @param {string} [options.lineCap='butt'] - Style of the line's end caps ('butt', 'round', 'square').
   * @returns {object} Object containing the line's details.
   */
  async drawLine(options) {
    this.lastReference = await this.lineDrawer.drawLine(options, this.lastReference);
    return this.lastReference;
  }

  /**
   * Draws a triangle on the canvas.
   * @param {object} options - Options for drawing the triangle.
   * @param {number} options.x - Horizontal position of the triangle.
   * @param {number} options.y - Vertical position of the triangle.
   * @param {number} options.width - Width of the triangle base.
   * @param {number} options.height - Height of the triangle.
   * @param {string} [options.position='topLeft'] - Positioning reference ('topLeft', 'topRight', 'bottomLeft', 'bottomRight').
   * @param {string} [options.backgroundColor='transparent'] - Background color of the triangle.
   * @param {string} [options.borderColor] - Border color of the triangle.
   * @param {number} [options.borderWidth] - Border width of the triangle.
   * @returns {object} Object containing the line's details.
   */
  async drawTriangle(options) {
    this.lastReference = await this.triangleDrawer.drawTriangle(options, this.lastReference);
    return this.lastReference;
  }
  
  /**
   * Draws text on the canvas.
   * @param {Object} options - Options for drawing the text.
   * @param {string} options.text - The text to draw.
   * @param {string|number} options.x - The x-coordinate of the text.
   * @param {string|number} options.y - The y-coordinate of the text.
   * @param {string} [options.font='30px sans-serif'] - Font style for the text.
   * @param {string} [options.color='#000000'] - Color of the text.
   * @param {string} [options.align='start'] - Text alignment ('start', 'end', 'left', 'right', 'center').
   * @param {string} [options.baseline='alphabetic'] - Text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom').
   * @returns {object} Object containing the text details.
   */
  async drawText(options) {
    this.lastReference = await this.textDrawer.drawText(options, this.lastReference);
    return this.lastReference;
  }

  /**
   * Sets the canvas context for drawing operations.
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
   */
  setContext(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.rectDrawer.setContext(ctx);
    this.circleDrawer.setContext(ctx);
  }
  
  /**
   * Clears the cache based on the provided options.
   * @param {object} [options] - Options to specify which parts of the cache to clear.
   * @param {boolean} [options.images] - Whether to clear the image cache (default: true).
   * @param {boolean} [options.elements] - Whether to clear the elements cache (default: true).
   */
  clearCache(options = { images: true, elements: true }) {
    clearCache(options);
  }

  /**
   * Retrieves or generates an attachment based on fileName and mimeType.
   * @param {string} fileName - Name of the attachment file.
   * @param {object} [options] - Options for generating the attachment.
   * @param {number} [options.quality] - Quality of the image (0 to 100, applicable for "image/jpeg" and "image/webp").
   * @param {string} [options.mimeType] - MIME type of the attachment (default: "image/jpeg").
   * @returns {Promise<AttachmentBuilder>} Attachment builder instance.
   */
  async generateAttachment(fileName, options = { mimeType: "image/jpeg", quality: 100 }) {
    const { mimeType, quality } = options;
    
    if (!isValidMimeType(mimeType)) throw new Error(`Invalid Mime Type: ${mimeType}`);

    const buffer = this.canvas.toBuffer(mimeType, quality);
    const attachment = new AttachmentBuilder(buffer, { name: fileName });
    return attachment;
  }

  /**
   * Retrieves or generates a buffer based on mimeType.
   * @param {string} [mimeType] - MIME type of the buffer (default: "image/jpeg").
   * @param {number} [quality] - Quality of the image (0 to 100, applicable for "image/jpeg" and "image/webp").
   * @returns {Buffer} Buffer of the canvas.
   */
  getBuffer(mimeType="image/jpeg", quality=100) {
    if (!isValidMimeType(mimeType)) throw new Error(`Invalid Mime Type: ${mimeType}`);

    const buffer = this.canvas.toBuffer(mimeType, quality);
    return buffer;
  }
}

module.exports = CanvasDrawer;
