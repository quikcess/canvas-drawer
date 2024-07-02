/**
 * Converts a pixel value string to a number.
 * @param {string|number} value - Pixel value string to convert.
 * @returns {number} Converted pixel value as a number.
 */
const pxToNumber = (value) => {
  if (typeof value === 'string' && value.endsWith('px')) {
    return parseFloat(value);
  } else if (!isNaN(parseFloat(value))) {
    return parseFloat(value);
  }
  return value;
};


/**
 * Parses borderRadius values into an array of four numbers.
 * @param {number|string|Array} borderRadius - BorderRadius value(s) to parse.
 * @returns {number[]} Array of four numbers representing top-left, top-right, bottom-right, bottom-left radii.
 */
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

/**
 * Draws a rounded rectangle on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Context to draw on.
 * @param {number} x - X-coordinate of the top-left corner.
 * @param {number} y - Y-coordinate of the top-left corner.
 * @param {number} width - Width of the rectangle.
 * @param {number} height - Height of the rectangle.
 * @param {number} borderRadius - Radius of the rectangle's corners.
 */
const roundRect = (ctx, x, y, width, height, borderRadius) => {
  const [topLeft, topRight, bottomRight, bottomLeft] = parseBorderRadius(borderRadius);
  ctx.beginPath();
  ctx.moveTo(x + topLeft, y);
  ctx.lineTo(x + width - topRight, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
  ctx.lineTo(x + width, y + height - bottomRight);
  ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
  ctx.lineTo(x + bottomLeft, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
  ctx.lineTo(x, y + topLeft);
  ctx.quadraticCurveTo(x, y, x + topLeft, y);
  ctx.closePath();
}

/**
 * Calculates the position and dimensions for drawing an element on the canvas.
 * Supports positioning based on absolute values, centering, and relative positioning to a reference object.
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
 * @param {number|string} [x=0] - X-coordinate or alignment ('center') of the element.
 * @param {number|string} [y=0] - Y-coordinate or alignment ('center') of the element.
 * @param {number|string} [width] - Width of the element.
 * @param {number|string} [height] - Height of the element.
 * @param {number} [radius] - Radius of the element (for circles).
 * @param {Object} [reference] - Reference object for positioning relative to another element.
 * @param {Object} [lastReference] - Last reference object used for positioning.
 * @returns {Object} - Object containing calculated position and dimensions.
 */
const calculatePosition = ({ ctx, x = 0, y = 0, width, height, radius, reference, lastReference }) => {
  let posX = pxToNumber(x);
  let posY = pxToNumber(y);

  width = pxToNumber(width);
  height = pxToNumber(height);
  radius = pxToNumber(radius);

  if (typeof x === 'string' && x.toLowerCase() === 'center') {
    posX = (ctx.canvas.width - (width || radius)) / 2;
  }

  if (typeof y === 'string' && y.toLowerCase() === 'center') {
    posY = (ctx.canvas.height - (height || radius)) / 2;
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