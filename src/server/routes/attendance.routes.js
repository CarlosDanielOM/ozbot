const express = require('express');
const router = express.Router();

const attendanceSchema = require('../../../models/attendance');

router.get('/', async (req, res) => {
    let query = req.query;

    let today = new Date();
    let day = query.day ?? today.getDate();
    let month = query.month ?? today.getMonth() + 1;
    let year = query.year ?? today.getFullYear();
    
    let attendance = await attendanceSchema.find({'date.day': day, 'date.month': month, 'date.year': year}, 'login date present total');
    res.json(attendance);
});

module.exports = router;