const express = require("express");
const { fetchTokenInfo } = require("../services/tokenService");
const requestQueue = require("../utils/requestQueue");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const tokenInfo = await requestQueue.add(clientIP, () => fetchTokenInfo(req.query.query));
    res.json(tokenInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
