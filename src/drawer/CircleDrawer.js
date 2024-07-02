const { calculatePosition } = require("./CanvasHelper");

class CircleDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  drawCircle(options = {}, lastReference=null) {
    const { x, y, radius, reference, ...rest } = options;
    const { posX, posY, circleRadius } = calculatePosition(this, { x, y, radius, reference, lastReference });

    this.ctx.save();

    if (rest.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = rest.backgroundColor;
      this.ctx.beginPath();
      this.ctx.arc(posX + circleRadius, posY + circleRadius, circleRadius, 0, Math.PI * 2);
      this.ctx.closePath();
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

      this.ctx.beginPath();
      this.ctx.arc(posX + circleRadius, posY + circleRadius, circleRadius, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Update lastReference to current circle dimensions
    return { x: posX, y: posY, width: circleRadius * 2, height: circleRadius * 2 };
  }
}

module.exports = CircleDrawer;
