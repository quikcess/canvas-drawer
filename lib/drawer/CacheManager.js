const { loadImage } = require("@napi-rs/canvas");

const imageError404URL = "https://i.ibb.co/CJYLYrt/Error404.jpg";
let errorImage;
loadImage(imageError404URL).then(image => { errorImage = image; });

// Cache object to store items
const cache = {};

const CACHE_EXPIRATION_MS = 3 * 24 * 60 * 60 * 1000; // Expiration time for cache in milliseconds (3 days)
const ERROR_IMAGE_EXPIRATION_MS = 5 * 60 * 1000; // Expiration time for error images in milliseconds (5 minutes)

/**
 * Retrieves a value from the cache or loads it using the provided load function.
 * @param {string} type - Type of cache (e.g., 'images', 'data', etc.).
 * @param {string} key - Key to identify the cached item.
 * @param {Function} loadFunction - Function to load the item if not in cache.
 * @returns {Promise<any>} - The cached or loaded value.
 */
async function getFromCacheOrLoad(type, key, loadFunction) {
  if (!cache[type]) {
    cache[type] = {};
  }

  const cachedItem = cache[type][key];
  if (cachedItem && Date.now() < cachedItem.expiration) {
    return cachedItem.value;
  }

  try {
    const value = await loadFunction();
    cache[type][key] = { value, expiration: Date.now() + CACHE_EXPIRATION_MS };
    return value;
  } catch (error) {
    if (type === 'images') {
      cache[type][key] = { value: errorImage, expiration: Date.now() + ERROR_IMAGE_EXPIRATION_MS };
      console.warn(`[Failed] To load image (${key}):`, error.message);
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
async function getCachedImage(url, key=null) {
  return getFromCacheOrLoad('images', key ?? url, () => loadImage(url));
}

/**
 * Clears the entire cache or specific types of cache based on provided options.
 * @param {Object} type - Type of cache.
 * @param {boolean} key - Key of cache.
 * @param {boolean} value - Value of cache.
 * @param {boolean} [expiration] - Expiration of cache.
 * @returns {Promise<Cache>} - The cache.
 */
async function setCache(type, key, value, expiration=CACHE_EXPIRATION_MS) {
  cache[type][key] = { value, expiration: Date.now() + expiration };
  return cache[type][key];
}

/**
 * Clears the entire cache or specific types of cache based on provided options.
 * @param {Object} type - Type of cache.
 * @param {boolean} [key] - Key of cache.
 * @returns {Boolean} Is it cached, yes or no?.
 */
function hasCached(type, key=null) {
  const cachedItem = cache[type][key];
  if (cachedItem && Date.now() < cachedItem.expiration) {
    return true;
  } else {
    return false;
  }
}

/**
 * Clears the entire cache or specific types of cache based on provided options.
 * @param {Object} options - Options to specify which parts of the cache to clear.
 * @param {boolean} options.images - Whether to clear the image cache (default: true).
 * @param {boolean} options.data - Whether to clear the data cache (default: true).
 */
function clearCache(options = { images: true, data: true }) {
  if (options.images && cache.images) {
    cache.images = {};
  }
  if (options.data && cache.data) {
    cache.data = {};
  }
}

module.exports = {
  cache,
  getFromCacheOrLoad,
  getCachedImage,
  hasCached,
  setCache,
  clearCache,
};