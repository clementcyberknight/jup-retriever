const express = require("express");
const { fetchTokenInfo } = require("../services/tokenService");
const requestQueue = require("../utils/requestQueue");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const tokenInfo = await requestQueue.add(() => fetchTokenInfo(req.query.query));
    res.json(tokenInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
