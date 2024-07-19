const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { getCachedImage, setCache, hasCached } = require("./CacheManager");
const { pixelParser } = require("./CanvasHelper");

/**
 * Draws a button on a canvas context.
 * @param {Object} options - Options for drawing the image.
 * @param {string} options.imgUrl - The URL or path to the image.
 * @param {number} [options.opacity=1.0] - The opacity of the image.
 * @param {number} [options.width=null] - The width to resize the image.
 * @param {number} [options.height=null] - The height to resize the image.
 * @param {string} [options.color=null] - The hexadecimal color to paint the image.
 * @returns {Promise<string>} The URL of the transformed and cached image.
 */
async function Image(options = {}) {
  try {
    const {
      imgUrl = null, opacity = 1.0,
      width = null, height = null,
      color = null,
    } = pixelParser(options, ['imgUrl', 'opacity', 'color']);

    const keyImage = `${imgUrl}-${width}-${height}-${color}`;
    if (!hasCached("images", keyImage)) {
      const image = await getCachedImage(imgUrl, keyImage);

      const finalWidth = width || image.width;
      const finalHeight = height || image.height;

      const canvas = createCanvas(finalWidth, finalHeight);
      const ctx = canvas.getContext('2d');

      ctx.save();
      ctx.globalAlpha = opacity;

      // Resize the image
      ctx.drawImage(image, 0, 0, finalWidth, finalHeight);

      // Paint the image with the specified color, if provided
      if (color) {
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, finalWidth, finalHeight);
      }

      // Restore context state
      ctx.restore();
      
      // Quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Generate a data URL for the transformed image
      const transformedImageUrl = canvas.toDataURL("image/png");

      // Cache the transformed image
      await setCache('images', keyImage, await loadImage(transformedImageUrl));
    }

    return { url: keyImage };
  } catch (error) {
    console.error("[ERROR] Image:", error);
    throw error;
  }
}

module.exports = Image;