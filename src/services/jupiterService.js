const { JUP_API_BASE_URL } = require("../config/constants");

/**
 * Search Jupiter tokens by symbol, name, or mint address.
 * Accepts comma-separated queries for batch lookups (up to 100 mints).
 */
async function searchJupiterTokens(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${JUP_API_BASE_URL}/search?query=${encodedQuery}`);
    if (!response.ok) {
      console.warn(`Jupiter search failed: ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`Failed to search Jupiter: ${error.message}`);
    return [];
  }
}

/**
 * Convenience wrapper to fetch a single token. Uses the search endpoint
 * and returns the first match, or null if none found.
 */
async function fetchJupiterToken(mintAddress) {
  const results = await searchJupiterTokens(mintAddress);
  return results.length > 0 ? results[0] : null;
}

module.exports = { fetchJupiterToken, searchJupiterTokens };
