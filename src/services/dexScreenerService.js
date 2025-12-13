const { DEXSCREENER_API_BASE_URL } = require("../config/constants");

async function fetchDexScreenerToken(mintAddress) {
  const url = `${DEXSCREENER_API_BASE_URL}/tokens/${mintAddress}`;
  try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`DexScreener fetch failed: ${response.status}`);
        return null;
      }
      return await response.json();
  } catch (error) {
      console.warn(`Failed to fetch DexScreener info: ${error.message}`);
      return null;
  }
}

module.exports = { fetchDexScreenerToken };
