const express = require('express');
const { fetchTokenInfo } = require('../services/jupService');

const router = express.Router();

router.get('/token/:query', async (req, res, next) => {
    try {
        const tokenInfo = await fetchTokenInfo(req.params.query);
        res.json(tokenInfo);
    } catch (error) {
        next(error);
    }
});

module.exports = router;