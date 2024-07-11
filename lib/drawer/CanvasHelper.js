/**
 * Converts a pixel value string to a number.
 * @param {string|number} value - Pixel value string to convert.
 * @returns {number|number[]} Converted pixel value as a number or array of numbers.
 */
const pxToNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return value; // Handle null or undefined values

  const valuesArray = typeof value === 'string' ? value.split(' ').map(v => {
    const parsed = parseFloat(v);
    return v.endsWith('px') || !isNaN(parsed) ? parsed : v;
  }) : Array.isArray(value) ? value.map(v => parseFloat(v)) : value;

  return valuesArray.length === 1 ? valuesArray[0] : valuesArray;
};

/**
 * Converts pixel value strings in an options object to numbers.
 * @param {object} options - Options object with pixel values to parse.
 * @returns {object} Transformed options object with pixel values as numbers.
 */
const pixelParser = (options, approach=[]) => {
  const transformedOptions = {};
  for (const [key, value] of Object.entries(options)) {
    if (!approach.includes(key)) transformedOptions[key] = pxToNumber(value);
    else transformedOptions[key] = value;
  }
  return transformedOptions;
};

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
      console.warn('[Failed] Invalid borderRadius values:', borderRadius);
    }
  } else if (typeof borderRadius === 'number') {
    const value = parseFloat(borderRadius);
    if (!isNaN(value)) {
      values = [value, value, value, value];
    } else {
      console.warn('[Failed] Invalid borderRadius value:', borderRadius);
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
      console.warn('[Failed] Invalid borderRadius array:', borderRadius);
    }
  } else {
    console.warn('[Failed] Invalid borderRadius:', borderRadius);
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
 * Parse padding options from various formats to individual padding values.
 * @param {string|number|Array} padding - Padding value(s) in various formats.
 * @returns {object} Object with individual padding values { top, right, bottom, left }.
 */
function parsePadding(padding) {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }

  if (typeof padding === 'string') {
    const paddingArray = padding.split(' ').map(value => parseInt(value));
    switch (paddingArray.length) {
      case 1:
        return { top: paddingArray[0], right: paddingArray[0], bottom: paddingArray[0], left: paddingArray[0] };
      case 2:
        return { top: paddingArray[0], right: paddingArray[1], bottom: paddingArray[0], left: paddingArray[1] };
      case 3:
        return { top: paddingArray[0], right: paddingArray[1], bottom: paddingArray[2], left: paddingArray[1] };
      case 4:
        return { top: paddingArray[0], right: paddingArray[1], bottom: paddingArray[2], left: paddingArray[3] };
      default:
        throw new Error('Invalid padding format');
    }
  }

  if (Array.isArray(padding)) {
    switch (padding.length) {
      case 1:
        return { top: padding[0], right: padding[0], bottom: padding[0], left: padding[0] };
      case 2:
        return { top: padding[0], right: padding[1], bottom: padding[0], left: padding[1] };
      case 3:
        return { top: padding[0], right: padding[1], bottom: padding[2], left: padding[1] };
      case 4:
        return { top: padding[0], right: padding[1], bottom: padding[2], left: padding[3] };
      default:
        throw new Error('Invalid padding format');
    }
  }

  throw new Error('Invalid padding format');
}

module.exports = {
  parseBorderRadius,
  parsePadding,
  roundRect,
  pxToNumber,
  pixelParser,
}