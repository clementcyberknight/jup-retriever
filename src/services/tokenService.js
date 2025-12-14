const { fetchJupiterToken, searchJupiterTokens } = require("./jupiterService");
const { fetchDexScreenerToken } = require("./dexScreenerService");

const MAX_MULTI_MINTS = 100;

function parseMintList(rawQuery) {
  if (!rawQuery || typeof rawQuery !== "string") return [];
  return rawQuery
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchMultipleTokens(mintList) {
  // Use Jupiter search only (no Dexscreener) for batch lookups
  const queryParam = mintList.join(",");
  const results = await searchJupiterTokens(queryParam);
  if (!Array.isArray(results)) return [];

  return results.map((token) => ({
    chainId: "solana",
    tokenAddress: token.mint,
    symbol: token.symbol || null,
    name: token.name || null,
    icon: token.logoURI || token.icon || null,
    decimals: token.decimals ?? null,
    usdPrice: token.usdPrice || 0,
    mcap: token.mcap || 0,
    fdv: token.fdv || 0,
    liquidity: token.liquidity || 0,
    numberOfHolders: token.holderCount || 0,
    tags: token.tags || [],
    isVerified: token.isVerified ?? false,
    source: "Jupiter search",
  }));
}

async function fetchTokenStandardized(query) {
  const mintList = parseMintList(query);
  if (mintList.length === 0) {
    throw new Error("query is required");
  }

  if (mintList.length > 1) {
    if (mintList.length > MAX_MULTI_MINTS) {
      throw new Error(`Maximum of ${MAX_MULTI_MINTS} mints supported per request`);
    }
    return fetchMultipleTokens(mintList);
  }

  const mintAddress = mintList[0];

  const jupPromise = fetchJupiterToken(mintAddress);
  const dexPromise = fetchDexScreenerToken(mintAddress);

  let jupData, dexData;
  try {
    [jupData, dexData] = await Promise.all([jupPromise, dexPromise]);
  } catch (error) {
    console.error(`Error fetching upstream data for ${mintAddress}:`, error);
  }

  let bestPair = null;
  if (dexData && dexData.pairs && dexData.pairs.length > 0) {
    bestPair = dexData.pairs
      .filter((p) => p.chainId === "solana")
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
  }

  const result = {
    chainId: "solana",
    tokenAddress: mintAddress,
    symbol: null,
    name: null,
    icon: null,
    decimals: null,
    description: null,

    usdPrice: 0,
    mcap: 0,
    fdv: 0,
    liquidity: 0,

    totalSupply: null,
    circulatingSupply: null,
    tags: [],
    isVerified: false,

    priceChange: {
      m5: 0, h1: 0, h6: 0, h24: 0,
    },
    volume: {
      m5: 0, h1: 0, h6: 0, h24: 0,
    },
    transactions: {
      m5: { buys: 0, sells: 0 },
      h1: { buys: 0, sells: 0 },
      h6: { buys: 0, sells: 0 },
      h24: { buys: 0, sells: 0 },
    },

    numberOfHolders: 0,
    topHolders: 0,
    pairCreatedAt: null,
    creatorAddress: null,
    isMutable: false,

    links: {
      website: null,
      socials: [],
      dexscreener: null,
    },

    recentBuyCount: 0,
    source: "Jupiter and dexscreener",
  };

  if (bestPair) {
    result.symbol = bestPair.baseToken.symbol;
    result.name = bestPair.baseToken.name;
    result.icon = bestPair.info?.imageUrl || null;
    result.dexscreener = bestPair.url;
    result.links.dexscreener = bestPair.url;

    result.usdPrice = parseFloat(bestPair.priceUsd) || 0;
    result.mcap = bestPair.marketCap || 0;
    result.fdv = bestPair.fdv || 0;
    result.liquidity = bestPair.liquidity?.usd || 0;
    result.pairCreatedAt = bestPair.pairCreatedAt
      ? new Date(bestPair.pairCreatedAt).toISOString()
      : undefined;

    if (bestPair.priceChange) {
      Object.keys(result.priceChange).forEach((k) => {
        if (bestPair.priceChange[k] !== undefined) result.priceChange[k] = bestPair.priceChange[k];
      });
    }
    if (bestPair.volume) {
      Object.keys(result.volume).forEach((k) => {
        if (bestPair.volume[k] !== undefined) result.volume[k] = bestPair.volume[k];
      });
    }
    if (bestPair.txns) {
      Object.keys(result.transactions).forEach((k) => {
        if (bestPair.txns[k]) result.transactions[k] = bestPair.txns[k];
      });
      if (bestPair.txns.h1) result.recentBuyCount = bestPair.txns.h1.buys || 0;
    }

    if (bestPair.info?.websites && bestPair.info.websites.length > 0) {
      result.links.website = bestPair.info.websites[0].url;
    }
    if (bestPair.info?.socials) {
      bestPair.info.socials.forEach((s) => {
        if (!result.links.socials.some((existing) => existing.url === s.url)) {
          result.links.socials.push({ name: s.type, url: s.url });
        }
      });
    }
  }

  if (jupData) {
    if (!result.symbol) result.symbol = jupData.symbol;
    if (!result.name) result.name = jupData.name;
    // Prioritize Jupiter icon, but keep DexScreener (info.imageUrl) as fallback if Jup is missing
    const jupIcon = jupData.logoURI || jupData.icon;
    if (jupIcon) {
      result.icon = jupIcon;
    }

    result.decimals = jupData.decimals;
    result.numberOfHolders = jupData.holderCount || 0;

    // Fallbacks for price/market data if missing from DexScreener
    if (!result.usdPrice && jupData.usdPrice) result.usdPrice = jupData.usdPrice;
    if (!result.mcap && jupData.mcap) result.mcap = jupData.mcap;
    if (!result.fdv && jupData.fdv) result.fdv = jupData.fdv;
    // Note: Jupiter liquidity might be aggregated, but we can use it as fallback
    if (!result.liquidity && jupData.liquidity) result.liquidity = jupData.liquidity;

    // Additional Fields
    if (jupData.totalSupply) result.totalSupply = jupData.totalSupply;
    if (jupData.circSupply) result.circulatingSupply = jupData.circSupply;
    if (jupData.tags) result.tags = jupData.tags;
    if (jupData.isVerified !== undefined) result.isVerified = jupData.isVerified;

    if (jupData.audit && jupData.audit.topHoldersPercentage) {
      result.topHolders = jupData.audit.topHoldersPercentage;
    }

    result.creatorAddress = jupData.dev || jupData.mintAuthority || null;
    result.isMutable = !!jupData.mintAuthority;

    if (!result.links.website && jupData.website) {
      result.links.website = jupData.website;
    }

    if (jupData.twitter) {
      const exists = result.links.socials.find((s) => s.url === jupData.twitter);
      if (!exists) result.links.socials.push({ name: "twitter", url: jupData.twitter });
    }
    if (jupData.discord) {
      const exists = result.links.socials.find((s) => s.url === jupData.discord);
      if (!exists) result.links.socials.push({ name: "discord", url: jupData.discord });
    }
  }

  if (!result.symbol && !result.name) {
    console.error(`Failed to fetch token data for ${mintAddress}: Data incomplete`);
    return null;
  }

  console.log(`${result.name} price is at ${result.usdPrice} and mcap of ${result.mcap} was found`);
  return result;
}

module.exports = {
  fetchTokenInfo: fetchTokenStandardized,
  fetchTokenStandardized,
};
