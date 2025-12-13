const { JUP_API_BASE_URL } = require("../config/constants");

async function fetchJupiterToken(mintAddress) {
  try {
    const response = await fetch(`${JUP_API_BASE_URL}/search?query=${mintAddress}`);
    if (!response.ok) {
        console.warn(`Jupiter fetch failed: ${response.statusText}`);
        return null; 
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
        return data[0]; 
    }
    return null;
  } catch (error) {
    console.warn(`Failed to fetch Jupiter info: ${error.message}`);
    return null;
  }
}

module.exports = { fetchJupiterToken };
