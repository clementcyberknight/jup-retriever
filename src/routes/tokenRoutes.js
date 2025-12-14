const express = require("express");
const { fetchTokenInfo } = require("../services/tokenService");
const requestQueue = require("../utils/requestQueue");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: "query parameter is required" });
    }

    const tokenInfo = await requestQueue.add(() => fetchTokenInfo(query));
    res.json(tokenInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
