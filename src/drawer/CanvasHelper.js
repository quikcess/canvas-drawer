const pxToNumber = (value) => {
  if (typeof value === 'string' && value.endsWith('px')) {
    return parseFloat(value);
  }
  return value;
};

const parseBorderRadius = (borderRadius) => {
  let values = [0, 0, 0, 0];

  if (typeof borderRadius === 'string') {
    borderRadius = borderRadius.trim();
    const parts = borderRadius.split(/\s+/).map(part => parseFloat(part));

    if (parts.length === 1) {
      values = [parts[0], parts[0], parts[0], parts[0]];
    } else if (parts.length === 2) {
      values = [parts[0], parts[1], parts[0], parts[1]];
    } else if (parts.length === 3) {
      values = [parts[0], parts[1], parts[2], parts[1]];
    } else if (parts.length === 4) {
      values = parts;
    } else {
      console.warn('Invalid borderRadius values:', borderRadius);
    }
  } else if (typeof borderRadius === 'number') {
    const value = parseFloat(borderRadius);
    if (!isNaN(value)) {
      values = [value, value, value, value];
    } else {
      console.warn('Invalid borderRadius value:', borderRadius);
    }
  } else if (Array.isArray(borderRadius)) {
    const parts = borderRadius.map(value => parseFloat(value));
    if (parts.length === 1) {
      values = [parts[0], parts[0], parts[0], parts[0]];
    } else if (parts.length === 2) {
      values = [parts[0], parts[1], parts[0], parts[1]];
    } else if (parts.length === 3) {
      values = [parts[0], parts[1], parts[2], parts[1]];
    } else if (parts.length === 4) {
      values = parts;
    } else {
      console.warn('Invalid borderRadius array:', borderRadius);
    }
  } else {
    console.warn('Invalid borderRadius:', borderRadius);
  }

  return values;
}

const roundRect = (self, x, y, width, height, borderRadius) => {
  const [topLeft, topRight, bottomRight, bottomLeft] = parseBorderRadius(borderRadius);
  self.ctx.beginPath();
  self.ctx.moveTo(x + topLeft, y);
  self.ctx.lineTo(x + width - topRight, y);
  self.ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
  self.ctx.lineTo(x + width, y + height - bottomRight);
  self.ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
  self.ctx.lineTo(x + bottomLeft, y + height);
  self.ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
  self.ctx.lineTo(x, y + topLeft);
  self.ctx.quadraticCurveTo(x, y, x + topLeft, y);
  self.ctx.closePath();
}

const calculatePosition = (self, { x = 0, y = 0, width, height, radius, reference, lastReference }) => {
  let posX = pxToNumber(x);
  let posY = pxToNumber(y);

  width = pxToNumber(width);
  height = pxToNumber(height);
  radius = pxToNumber(radius);

  if (typeof x === 'string' && x.toLowerCase() === 'center') {
    posX = (self.canvas.width - (width || radius)) / 2;
  }

  if (typeof y === 'string' && y.toLowerCase() === 'center') {
    posY = (self.canvas.height - (height || radius)) / 2;
  }

  if (reference && (typeof x === 'string' && x.toLowerCase() === 'center' || typeof y === 'string' && y.toLowerCase() === 'center')) {
    if (reference === 'auto' && lastReference) {
      reference = lastReference;
    }

    if (reference.x !== undefined) {
      const relX = pxToNumber(reference.x);
      if (typeof x === 'string' && x.toLowerCase() === 'center') {
        posX = reference.radius ?
          relX + pxToNumber(reference.radius) / 2 - (width || radius) / 2 :
          relX + (pxToNumber(reference.width) - (width || radius)) / 2;
      }
    }

    if (reference.y !== undefined) {
      const relY = pxToNumber(reference.y);
      if (typeof y === 'string' && y.toLowerCase() === 'center') {
        posY = reference.radius ?
          relY + pxToNumber(reference.radius) / 2 - (height || radius) / 2 :
          relY + (pxToNumber(reference.height) - (height || radius)) / 2;
      }
    }
  }

  if (radius) {
    const circleRadius = radius / 2;
    return { posX, posY, circleRadius };
  } else {
    const divWidth = width;
    const divHeight = height;
    return { posX, posY, divWidth, divHeight };
  }
}

module.exports = {
  pxToNumber,
  parseBorderRadius,
  roundRect,
  calculatePosition,
};