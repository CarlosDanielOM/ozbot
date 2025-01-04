const express = require('express');
const router = express.Router();

const attendanceSchema = require('../../../models/attendance');

router.get('/', async (req, res) => {
    let attendance = await attendanceSchema.find({date: {day: 1}});
    res.json(attendance);
});

module.exports = router;