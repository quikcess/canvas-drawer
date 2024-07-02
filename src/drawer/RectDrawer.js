const { calculatePosition, roundRect } = require("./CanvasHelper");

class RectDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  drawRect(options = {}, lastReference=null) {
    const { x, y, width, height, reference, borderRadius=0, ...rest } = options;
    const { posX, posY, divWidth, divHeight } = calculatePosition(this, { x, y, width, height, reference, lastReference });

    this.ctx.save();

    if (rest.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = rest.backgroundColor;
      roundRect(this, posX, posY, divWidth, divHeight, borderRadius);
      this.ctx.fill();
    }

    if (rest.borderColor && rest.borderWidth) {
      this.ctx.strokeStyle = rest.borderColor;
      const parsedBorderWidth = parseFloat(rest.borderWidth);

      if (!isNaN(parsedBorderWidth)) {
        this.ctx.lineWidth = parsedBorderWidth;
      } else {
        console.warn('Invalid borderWidth:', rest.borderWidth);
        this.ctx.lineWidth = 1;
      }

      switch (rest.borderStyle) {
        case 'dashed':
          this.ctx.setLineDash([6, 4]);
          break;
        case 'dotted':
          this.ctx.setLineDash([2, 2]);
          break;
        default:
          this.ctx.setLineDash([]);
          break;
      }

      roundRect(this, posX, posY, divWidth, divHeight, borderRadius);
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Update lastReference to current rectangle dimensions
    return { x: posX, y: posY, width: divWidth, height: divHeight };
  }
}

module.exports = RectDrawer;