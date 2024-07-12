const { getCachedImage } = require("./CacheManager");
const { parsePadding, parseBorderRadius, roundRect, pixelParser } = require("./CanvasHelper");

/**
 * Draws a button on a canvas context.
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {Object} options - Options for drawing the button.
 * @param {number|string} options.x - The x-coordinate of the center.
 * @param {number|string} options.y - The y-coordinate of the center.
 * @param {number|string} [options.width] - The fixed width of the button.
 * @param {number|string} [options.height] - The fixed height of the button.
 * @param {number|string|Array} [options.padding=5] - The padding around the button.
 * @param {string} [options.backgroundColor] - The background color of the button.
 * @param {string} [options.backgroundImage] - The URL or path to the background image.
 * @param {Array|string|Object} [options.backgroundGradient] - The gradient for the background.
 * @param {string} [options.borderColor] - The border color of the button.
 * @param {number} [options.borderWidth=1] - The width of the button's border.
 * @param {Array|string|Object} [options.borderGradient] - The gradient for the border.
 * @param {string} [options.borderStyle='solid'] - The style of the border ('solid', 'dashed', 'dotted').
 * @param {number|string} [options.borderRadius=0] - The radius of the button's corners.
 * @param {string} [options.text] - The text to display on the button.
 * @param {string} [options.font='30px sans-serif'] - The font style for the text.
 * @param {string} [options.color='#000'] - The color of the text.
 * @param {string} [options.iconURL] - The URL or path to the icon image.
 * @param {string} [options.iconPosition='left'] - The position of the icon relative to the text ('left' or 'right').
 * @param {number} [options.iconTextSpacing=10] - The spacing between the icon and the text.
 * @param {number} [options.iconWidth] - The fixed width of the icon.
 * @param {number} [options.iconHeight] - The fixed height of the icon.
 * @param {number} [options.iconScale] - The scale factor for the icon size.
 * @param {number} [options.opacity=1.0] - The opacity of the button.
 * @param {object} [options.reference] - Reference object for positioning.
 * @returns {Promise<object>} Object with dimensions of the drawn button { x, y, width, height }.
 */
async function ButtonDrawer(ctx, options = {}) {
  try {
    const {
      x, y, padding = 10, iconURL, iconWidth, iconHeight, opacity = 1.0,
      backgroundColor, backgroundImage, backgroundGradient,
      borderColor, borderWidth = 1, borderGradient, borderStyle, borderRadius = 0, reference,
      text, font = '30px sans-serif', color = '#000', iconPosition = 'left', iconTextSpacing = 10, iconScale,
      width, height
    } = pixelParser(options, ['backgroundImage', 'backgroundGradient', 'text', 'font', 'reference', 'borderGradient']);

    ctx.globalAlpha = opacity;

    const parsedPadding = parsePadding(padding);
    const parsedBorderRadius = parseBorderRadius(borderRadius);

    // Measure text size
    let textWidth = 0;
    let textHeight = 0;

    if (text) {
      ctx.font = font;
      const textMetrics = ctx.measureText(text);
      textWidth = textMetrics.width;
      textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent; // Approximate text height
    }

    // Measure icon size
    let parsedIconWidth = iconURL && iconWidth || 0;
    let parsedIconHeight = iconURL && iconHeight || 0;

    if (iconURL) {
      const image = await getCachedImage(iconURL);
      parsedIconWidth = (iconWidth ?? image.width) * (iconScale ?? 1);
      parsedIconHeight = (iconHeight ?? image.height) * (iconScale ?? 1);
    }

    // Calculate content dimensions
    const contentWidth = textWidth + (parsedIconWidth ? parsedIconWidth + (text ? iconTextSpacing : 0) : 0);
    const contentHeight = Math.max(parsedIconHeight, textHeight);

    // Determine button dimensions
    const buttonWidth = width ? width + parsedPadding.left + parsedPadding.right : contentWidth + parsedPadding.left + parsedPadding.right;
    const buttonHeight = height ? height + parsedPadding.top + parsedPadding.bottom : contentHeight + parsedPadding.top + parsedPadding.bottom;

    // Calculate button position
    let posX = x;
    let posY = y;
    
    const isCenterX = typeof x === 'string' && x.toLowerCase() === 'center';
    const isCenterY = typeof y === 'string' && y.toLowerCase() === 'center';

    if (isCenterX) posX = (ctx.canvas.width - buttonWidth) / 2;
    if (isCenterY) posY = (ctx.canvas.height - buttonHeight) / 2;

    if (reference && (isCenterX || isCenterY)) {
      if (isCenterX) posX = reference.x + ((reference.width || reference.radius || 0) - buttonWidth) / 2;
      if (isCenterY) posY = reference.y + ((reference.height || reference.radius || 0) - buttonHeight) / 2;
    }

    // Save current context state
    ctx.save();

    // Draw background image if provided
    if (backgroundImage) {
      const image = await getCachedImage(backgroundImage);

      ctx.save();
      roundRect(ctx, posX, posY, buttonWidth, buttonHeight, parsedBorderRadius);
      ctx.clip();
      ctx.drawImage(image, posX, posY, buttonWidth, buttonHeight);
      ctx.restore();
    }

    // Draw background color or background gradient if provided
    if (backgroundColor || backgroundGradient) {
      if (backgroundGradient) {
        let gradientColors;
        let gradientAngle = 0; // Default angle

        if (Array.isArray(backgroundGradient)) {
          gradientColors = backgroundGradient;
        } else if (typeof backgroundGradient === 'string') {
          gradientColors = backgroundGradient.split(' ');
        } else {
          const { angle = 0, stops, colors } = backgroundGradient;
          gradientAngle = angle;
          if (stops) {
            gradientColors = stops.map(stop => stop.color);
          } else if (colors) {
            gradientColors = Array.isArray(colors) ? colors : colors.split(' ');
          }
        }

        const radianAngle = (gradientAngle * Math.PI) / 180;
        const x0 = posX + (buttonWidth / 2) * Math.cos(radianAngle - Math.PI / 2);
        const y0 = posY + (buttonHeight / 2) * Math.sin(radianAngle - Math.PI / 2);
        const x1 = posX + (buttonWidth / 2) * Math.cos(radianAngle + Math.PI / 2);
        const y1 = posY + (buttonHeight / 2) * Math.sin(radianAngle + Math.PI / 2);

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });

        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = backgroundColor;
      }

      roundRect(ctx, posX, posY, buttonWidth, buttonHeight, parsedBorderRadius);
      ctx.fill();
    }

    // Draw border
    if (borderWidth > 0 && (borderColor || borderGradient)) {
      ctx.lineWidth = borderWidth;

      if (borderGradient) {
        let gradientColors;
        let gradientAngle = 0; // Default angle

        if (Array.isArray(borderGradient)) {
          gradientColors = borderGradient;
        } else if (typeof borderGradient === 'string') {
          gradientColors = borderGradient.split(' ');
        } else {
          const { angle = 0, stops, colors } = borderGradient;
          gradientAngle = angle;
          if (stops) {
            gradientColors = stops.map(stop => stop.color);
          } else if (colors) {
            gradientColors = Array.isArray(colors) ? colors : colors.split(' ');
          }
        }

        const radianAngle = (gradientAngle * Math.PI) / 180;
        const x0 = posX + (buttonWidth / 2) * Math.cos(radianAngle - Math.PI / 2);
        const y0 = posY + (buttonHeight / 2) * Math.sin(radianAngle - Math.PI / 2);
        const x1 = posX + (buttonWidth / 2) * Math.cos(radianAngle + Math.PI / 2);
        const y1 = posY + (buttonHeight / 2) * Math.sin(radianAngle + Math.PI / 2);

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        gradientColors.forEach((color, index) => {
          const offset = index / (gradientColors.length - 1);
          gradient.addColorStop(offset, color);
        });

        ctx.strokeStyle = gradient;
      } else {
        ctx.strokeStyle = borderColor;
      }

      roundRect(ctx, posX, posY, buttonWidth, buttonHeight, parsedBorderRadius);
      if (borderStyle === 'dashed') {
        ctx.setLineDash([10, 5]);
      } else if (borderStyle === 'dotted') {
        ctx.setLineDash([2, 2]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
    }

    // // Draw text and icon
    // const contentX = posX + parsedPadding.left;
    // const contentY = posY + parsedPadding.top;

    // let iconX = contentX;
    // let iconY = contentY + (buttonHeight - parsedPadding.top - parsedPadding.bottom - parsedIconHeight) / 2;
    // let textX = contentX;
    // let textY = contentY + (buttonHeight - parsedPadding.top - parsedPadding.bottom + textHeight) / 2;

    // if (iconURL) {
    //   if (iconPosition === 'left') {
    //     textX += parsedIconWidth + iconTextSpacing;
    //   } else {
    //     iconX = contentX + textWidth + iconTextSpacing;
    //   }
    // }

    // if (iconURL) {
    //   const image = await getCachedImage(iconURL);
    //   ctx.drawImage(image, iconX, iconY, parsedIconWidth, parsedIconHeight);
    // }

    // if (text) {
    //   ctx.font = font;
    //   ctx.fillStyle = color;
    //   ctx.fillText(text, textX, textY);
    // }

    // Draw icon and text
    const contentX = posX + (buttonWidth - contentWidth) / 2;
    const contentY = posY + (buttonHeight - contentHeight) / 2;

    const consideringText = text && iconURL ? textWidth : 0;
    const consideringIcon = iconURL && text ? iconTextSpacing : 0;

    if (iconURL) {
      const image = await getCachedImage(iconURL);

      const iconX = iconPosition === 'left' ? contentX : contentX + consideringText + consideringIcon;
      const iconY = contentY + (contentHeight - parsedIconHeight) / 2;
      ctx.drawImage(image, iconX, iconY, parsedIconWidth, parsedIconHeight);
    }

    if (text) {
      const textX = iconURL && iconPosition === 'left' ? contentX + parsedIconWidth + consideringIcon : contentX;
      const textY = contentY + (contentHeight + textHeight) / 2;
      ctx.fillStyle = color;
      ctx.fillText(text, textX, textY);
    }

    // Restore context state
    ctx.restore();

    return { x: posX, y: posY, width: buttonWidth, height: buttonHeight };
  } catch (error) {
    console.error("[ERROR] Drawing Button:", error);
    throw error;
  }
}

module.exports = ButtonDrawer;