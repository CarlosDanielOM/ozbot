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

        if(todayTotal === null) {
            todayTotal = 1;
        }

        todayTotal = parseInt(todayTotal);

        for(let i = 0; i < todayUsers.length; i++) {
            let user = todayUsers[i];
        
            let assistance = await cacheClient.get(`oz:assistance:${user}`);
            let doc = {
                login: user,
                date: {
                    day: today.getDate(),
                    month: today.getMonth() + 1,
                    year: today.getFullYear()
                },
                present: assistance ?? 0,
                total: todayTotal
            }
            todayAttendance.push(doc);
        }
        attendance = todayAttendance;
    }

    let attendanceList = await cacheClient.smembers('oz:list');
    
    res.json({
        status: 200,
        data: attendance,
        server_time: {
           hours: today.getHours(),
           minutes: today.getMinutes(),
           seconds: today.getSeconds()
        },
        server_date: {
            day: today.getDate(),
            month: today.getMonth() + 1,
            year: today.getFullYear()
        },
        list: attendanceList
    });
});

router.get('/unattended', async (req, res) => {
    const cacheClient = getClient();

    let list = await cacheClient.smembers('oz:list');
    let keys = await cacheClient.keys('oz:assistance:*');

    keys = keys.map(key => key.split(':')[2]);
    list = list.filter(user => !keys.includes(user));

    for(let i = 0; i < list.length; i++) {
        let user = list[i];

        // await cacheClient.set(`oz:assistance:${user}`, 0);
    }
    
    res.send({list: list.length, keys: keys.length});
});

router.get('/fix', async (req, res) => {
    let attendance = await attendanceSchema.find({'date.day': 31});
    let logins = attendance.map(user => user.login);

    for(let i = 0; i < attendance.length; i++) {
        
    }

    res.send({attendance: attendance.length, logins})
    
});

module.exports = router;