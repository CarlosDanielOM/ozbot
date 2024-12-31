const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '../routes/public/index.html'));
});

router.get('/list', async (req, res) => {
    res.sendFile(path.join(__dirname, '../routes/public/list.html'));
});

module.exports = router;