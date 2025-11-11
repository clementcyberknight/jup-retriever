const fetch = require('node-fetch');
const { JUP_API_BASE_URL } = require('../config/constants');

async function fetchTokenInfo(query) {
    try {
        const response = await fetch(`${JUP_API_BASE_URL}/search?query=${query}`);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch token info: ${error.message}`);
    }
}

module.exports = {
    fetchTokenInfo
};