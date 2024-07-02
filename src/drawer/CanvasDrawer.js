const { AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');

const RectDrawer = require('./RectDrawer');
const CircleDrawer = require('./CircleDrawer');

class CanvasDrawer {
  constructor(width, height) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    this.rectDrawer = new RectDrawer(this.ctx);
    this.circleDrawer = new CircleDrawer(this.ctx);
    this.lastReference = null;
  }

  drawRect(options = {}) {
    this.lastReference = this.rectDrawer.drawRect(options, this.lastReference);
  }

  drawCircle(options = {}) {
    this.lastReference = this.circleDrawer.drawCircle(options, this.lastReference);
  }

  setContext(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  getContext() {
    return this.ctx;
  }

  getBuffer(mimeType = "image/jpeg") {
    const buffer = this.canvas.toBuffer(mimeType);
    return buffer;
  }
  
  async generateAttachment(fileName, mimeType = "image/jpeg") {
    const buffer = this.canvas.toBuffer(mimeType);
    const attachment = new AttachmentBuilder(buffer, { name: fileName });
    return attachment;
  }

}

module.exports = CanvasDrawer;