const { fetchJupiterToken } = require("./jupiterService");
const { fetchDexScreenerToken } = require("./dexScreenerService");

async function fetchTokenStandardized(mintAddress) {
  const jupPromise = fetchJupiterToken(mintAddress);
  const dexPromise = fetchDexScreenerToken(mintAddress);

  const [jupData, dexData] = await Promise.all([jupPromise, dexPromise]);

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
    
    priceChange: {
      m5: 0, h1: 0, h6: 0, h24: 0
    },
    volume: {
      m5: 0, h1: 0, h6: 0, h24: 0
    },
    transactions: {
      m5: { buys: 0, sells: 0 },
      h1: { buys: 0, sells: 0 },
      h6: { buys: 0, sells: 0 },
      h24: { buys: 0, sells: 0 }
    },
    
    numberOfHolders: 0,
    topHolders: 0,
    pairCreatedAt: null,
    creatorAddress: null,
    isMutable: false,
    
    links: {
      website: null,
      socials: [],
      dexscreener: null
    },
    
    recentBuyCount: 0,
    source: "Jupiter and dexscreener" 
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
       Object.keys(result.priceChange).forEach(k => {
           if (bestPair.priceChange[k] !== undefined) result.priceChange[k] = bestPair.priceChange[k];
       });
    }
    if (bestPair.volume) {
       Object.keys(result.volume).forEach(k => {
           if (bestPair.volume[k] !== undefined) result.volume[k] = bestPair.volume[k];
       });
    }
    if (bestPair.txns) {
       Object.keys(result.transactions).forEach(k => {
           if (bestPair.txns[k]) result.transactions[k] = bestPair.txns[k];
       });
       if (bestPair.txns.h1) result.recentBuyCount = bestPair.txns.h1.buys || 0;
    }

    if (bestPair.info?.websites && bestPair.info.websites.length > 0) {
        result.links.website = bestPair.info.websites[0].url;
    }
    if (bestPair.info?.socials) {
        bestPair.info.socials.forEach(s => {
            if(!result.links.socials.some(existing => existing.url === s.url)) {
                result.links.socials.push({ name: s.type, url: s.url });
            }
        });
    }
  }

  if (jupData) {
    if (!result.symbol) result.symbol = jupData.symbol;
    if (!result.name) result.name = jupData.name;
    if (!result.icon) result.icon = jupData.logoURI || jupData.icon;
    
    result.decimals = jupData.decimals;
    result.numberOfHolders = jupData.holderCount || 0;
    
    if (jupData.audit && jupData.audit.topHoldersPercentage) {
        result.topHolders = jupData.audit.topHoldersPercentage;
    }

    result.creatorAddress = jupData.dev || jupData.mintAuthority || null;
    result.isMutable = !!jupData.mintAuthority;

    if (!result.links.website && jupData.website) {
        result.links.website = jupData.website;
    }
    
    if (jupData.twitter) {
        const exists = result.links.socials.find(s => s.url === jupData.twitter);
        if (!exists) result.links.socials.push({ name: "twitter", url: jupData.twitter });
    }
    if (jupData.discord) {
        const exists = result.links.socials.find(s => s.url === jupData.discord);
        if (!exists) result.links.socials.push({ name: "discord", url: jupData.discord });
    }
  }

  if (!result.symbol && !result.name) {
      return null;
  }

  return result;
}

module.exports = {
  fetchTokenInfo: fetchTokenStandardized,
  fetchTokenStandardized,
};
