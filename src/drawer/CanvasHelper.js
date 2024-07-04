/**
 * Converts a pixel value string to a number.
 * @param {string|number} value - Pixel value string to convert.
 * @returns {number} Converted pixel value as a number.
 */
const pxToNumber = (value) => {
  if (['number', 'object'].includes(typeof value)) return value;
  if (!value) return value; // Strange properties

  const valuesSplited = typeof value === 'string' ? String(value).split(' ') : value;
  const valuesArray=[];

  for (let valueSplited of valuesSplited) {
    if (valueSplited.endsWith('px')) {
      valuesArray.push(parseFloat(valueSplited));
    } else if (!isNaN(parseFloat(valueSplited))) {
      valuesArray.push(parseFloat(valueSplited));
    } else {
      return value;
    }
  };

  return valuesArray.length === 1 ? valuesArray[0] : valuesArray;
};

/**
 * Converts a pixel value string to a number.
 * @param {object} options - Options for parser to pixel.
 * @returns {number} Converted pixel value as a number.
 */
function pixelParser(options) {
  const transformedOptions = {};
  for (const [key, value] of Object.entries(options)) {
    if (value) transformedOptions[key] = pxToNumber(value);
  }
  return transformedOptions;
}


/**
 * Draws a rounded rectangle on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Context to draw on.
 * @param {number} x - X-coordinate of the top-left corner.
 * @param {number} y - Y-coordinate of the top-left corner.
 * @param {number} width - Width of the rectangle.
 * @param {number} height - Height of the rectangle.
 * @param {number|string|array} borderRadius - BorderRadius value(s) to parse.
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
 * Validates if the provided MIME type is valid.
 * @param {string} mimeType - MIME type to validate.
 * @returns {boolean} True if the MIME type is valid, otherwise false.
 */
function isValidMimeType(mimeType) {
  const validMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  return validMimeTypes.includes(mimeType);
}

/**
 * Parses borderRadius values into an array of four numbers.
 * @param {number|string|array} borderRadius - BorderRadius value(s) to parse.
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
 * Calculates the position and dimensions for drawing an element on the canvas.
 * Supports positioning based on absolute values, centering, and relative positioning to a reference object.
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
 * @param {string} shape - Shape of the element ('rectangle', 'circle', 'line', 'triangle').
 * @param {number|string} [x=0] - X-coordinate or alignment ('center') of the element.
 * @param {number|string} [y=0] - Y-coordinate or alignment ('center') of the element.
 * @param {number|string} [width] - Width of the element.
 * @param {number|string} [height] - Height of the element.
 * @param {number} [radius] - Radius of the element (for circles).
 * @param {number} [size] - Size of the element (for triangles).
 * @param {number} [borderWidth] - Element border width (for triangles).
 * @param {number} [lineWidth] - Element border width (for lines).
 * @param {Object} [reference] - Reference object for positioning relative to another element.
 * @param {Object} [lastReference] - Last reference object used for positioning.
 * @returns {Object} - Object containing calculated position and dimensions.
 */
const calculatePosition = ({
  ctx,
  shape,
  x = 0,
  y = 0,
  width,
  height,
  radius,
  size,
  borderWidth,
  lineWidth,
  reference,
  lastReference,
}) => {
  let posX = typeof x === 'string' ? 0 : x;
  let posY = typeof y === 'string' ? 0 : y;

  let referenceNow = reference === 'auto' ? lastReference || null : reference;

  const isCenterX = typeof x === 'string' && x.toLowerCase() === 'center';
  const isCenterY = typeof y === 'string' && y.toLowerCase() === 'center';

  if (shape === 'rectangle') {
    if (isCenterX) posX = (ctx.canvas.width - width) / 2;
    if (isCenterY) posY = (ctx.canvas.height - height) / 2;

    if (referenceNow && (isCenterX || isCenterY)) {
      if (isCenterX && referenceNow.x !== undefined) {
        posX = referenceNow.x + ((referenceNow.width || referenceNow.radius || 0) - width) / 2;
      }
      if (isCenterY && referenceNow.y !== undefined) {
        posY = referenceNow.y + ((referenceNow.height || referenceNow.radius || 0) - height) / 2;
      }
    }

    const divWidth = width;
    const divHeight = height;
    return { posX, posY, divWidth, divHeight };
  }

  if (shape === 'circle') {
    if (isCenterX) posX = ctx.canvas.width / 2;
    if (isCenterY) posY = ctx.canvas.height / 2;

    if (referenceNow && (isCenterX || isCenterY)) {
      if (isCenterX && referenceNow.x !== undefined) {
        posX = referenceNow.x + ((referenceNow.width || referenceNow.radius || 0) / 2);
      }
      if (isCenterY && referenceNow.y !== undefined) {
        posY = referenceNow.y + ((referenceNow.height || referenceNow.radius || 0) / 2);
      }
    }

    const circleRadius = radius / 2;
    return { posX, posY, circleRadius };
  }

  if (shape === 'line') {
    if (isCenterX) posX = ctx.canvas.width / 2;
    if (isCenterY) posY = ctx.canvas.height / 2;

    if (referenceNow && (isCenterX || isCenterY)) {
      if (isCenterX) posX = referenceNow.x + (referenceNow.width || referenceNow.radius || 0) / 2;
      if (isCenterY) posY = referenceNow.y + (referenceNow.height || referenceNow.radius || 0) / 2 + lineWidth / 2;
    }

    return { posX, posY };
  }

  if (shape === 'triangle') {
    if (isCenterX) posX = (ctx.canvas.width - size - borderWidth * 2) / 2;
    if (isCenterY) posY = (ctx.canvas.height - size - borderWidth * 2) / 2;

    if (referenceNow && (isCenterX || isCenterY)) {
      if (isCenterX) {
        posX = referenceNow.x + (referenceNow.width || referenceNow.radius || 0) / 2 - size / 2 - borderWidth;
      }
      if (isCenterY) {
        posY = referenceNow.y + (referenceNow.height || referenceNow.radius || 0) / 2 - size / 2 - borderWidth;
      }
    }

    return { posX, posY };
  }

  return { posX, posY };
};

module.exports = {
  pxToNumber,
  pixelParser,
  roundRect,
  isValidMimeType,
  parseBorderRadius,
  calculatePosition,
};