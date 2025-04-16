const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '../routes/public/index.html'));
});

router.get('/list', async (req, res) => {
    res.sendFile(path.join(__dirname, '../routes/public/list.html'));
});

router.get('/attendance', async (req, res) => {
    res.sendFile(path.join(__dirname, '../routes/public/attendance.html'));
});

router.get('/weekly-attendance', async (req, res) => {
    res.sendFile(path.join(__dirname, '../routes/public/weekly-attendance.html'));
});

module.exports = router;