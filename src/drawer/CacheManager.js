const { loadImage } = require("@napi-rs/canvas");

const imageError404URL = "https://i.ibb.co/CJYLYrt/Error404.jpg";

// Cache object to store images and elements
const cache = {
  images: {},
  elements: {},
};

const CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Automatically clear the entire cache every 7 days
setInterval(() => {
  clearCache();
}, CACHE_EXPIRATION_MS);

/**
 * Retrieves a value from the cache or loads it using the provided load function.
 * @param {string} type - Type of cache (e.g., 'images', 'elements').
 * @param {string} key - Key to identify the cached item.
 * @param {Function} loadFunction - Function to load the item if not in cache.
 * @returns {Promise<any>} - The cached or loaded value.
 */
async function getFromCacheOrLoad(type, key, loadFunction) {
  if (cache[type][key]) {
    return cache[type][key];
  }

  try {
    const value = await loadFunction();
    cache[type][key] = value;
    return value;
  } catch (error) {
    if (type === 'images') {
      const errorImage = await loadImage(imageError404URL);
      cache[type][key] = errorImage;
      console.warn('Failed to load image:', key, error);
      return errorImage;
    } else {
      throw error;
    }
  }
}

/**
 * Retrieves an image from the cache or loads it from the given URL.
 * @param {string} url - URL of the image to load.
 * @returns {Promise<Image>} - The cached or loaded image.
 */
async function getCachedImage(url) {
  return getFromCacheOrLoad('images', url, () => loadImage(url));
}

/**
 * Clears the cache based on the provided options.
 * @param {Object} [options] - Options to specify which parts of the cache to clear.
 * @param {boolean} [options.images] - Whether to clear the image cache (default: true).
 * @param {boolean} [options.elements] - Whether to clear the elements cache (default: true).
 */
function clearCache(options = { images: true, elements: true }) {
  if (options.images) {
    cache.images = {};
  }
  if (options.elements) {
    cache.elements = {};
  }
}

module.exports = {
  cache,
  getFromCacheOrLoad,
  getCachedImage,
  clearCache,
};
