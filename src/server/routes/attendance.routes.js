const express = require('express');
const router = express.Router();

const attendanceSchema = require('../../../models/attendance');
const { getClient } = require('../../../util/database/dragonfly');

router.get('/', async (req, res) => {
    const cacheClient = getClient();

    let query = req.query;

    let today = new Date();
    let day = query.day ?? today.getDate();
    let month = query.month ?? today.getMonth() + 1;
    let year = query.year ?? today.getFullYear();
    
    let attendance = await attendanceSchema.find({'date.day': day, 'date.month': month, 'date.year': year}, 'login date present total');

    let todayTotal = 0;
    let todayUsers = null;
    let todayAttendance = [];

    if(attendance.length === 0) {
        todayTotal = await cacheClient.get('oz:assistance:total');
        let keys = await cacheClient.keys('oz:assistance:*');
        todayUsers = keys.map(key => key.split(':')[2]);

        for(let i = 0; i < todayUsers.length; i++) {
            let user = todayUsers[i];
        
            let assistance = await cacheClient.get(`oz:assistance:${user}`);
            let doc = {
                login: user,
                date: {
                    day: today.getDate(),
                    month: today.getMonth(),
                    year: today.getFullYear()
                },
                present: assistance ?? 0,
                total: todayTotal
            }
            todayAttendance.push(doc);
        }
        attendance = todayAttendance;
    }
    
    res.json({
        status: 200,
        data: attendance
    });
});

module.exports = router;