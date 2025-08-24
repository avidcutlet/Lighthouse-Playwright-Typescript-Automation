import { ALL_TEST_URLS } from '@config/lighthouse.config';

/**
 * Extracts subdirectories from URLs in a given object.
 * This function iterates through all URL strings, parses each one,
 * and returns a list of subdirectories, ignoring the root homepage.
 *
 * @param {object} lighthouseData The object containing URL data.
 * @returns {string[]} An array of subdirectory strings.
 */
export function getSubdirectories() {
  const subdirectories = new Set();
  
  for (const urlString of ALL_TEST_URLS) {
    try {
      const url = new URL(urlString);
      
      const pathname = url.pathname;
      
      if (pathname !== '/') {
        subdirectories.add(pathname.substring(1));
      }
    } catch (error) {
      // Log any malformed URLs so we can debug them.
      console.error(`Invalid URL found: ${urlString}`, error);
    }
  }
  
  return Array.from(subdirectories);
}