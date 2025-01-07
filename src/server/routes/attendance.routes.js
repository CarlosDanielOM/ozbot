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
        todayTotal = await cacheClient.get('oz:assistance:total') ?? 1;
        let keys = await cacheClient.keys('oz:assistance:*');
        todayUsers = keys.map(key => key.split(':')[2]);

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
    
    res.json({
        status: 200,
        data: attendance,
        server_time: {
           hours: today.getHours(),
           minutes: today.getMinutes(),
           seconds: today.getSeconds()
        }
    });
});

router.get('/fix', async (req, res) => {
    // let attendance = await attendanceSchema.find();

    // for(let i = 0; i < attendance.length; i++) {
    //     let dateDay = attendance[i].date.day;
    //     let dateMonth = attendance[i].date.month;
    //     let dateYear = attendance[i].date.year;

    //     dateDay--;
        
    //     attendance[i].date.day = dateDay;
    //     attendance[i].date.month = dateMonth;
    //     attendance[i].date.year = dateYear;

    //     if(dateDay < 1) {
    //         attendance[i].date.day = 31;
    //         attendance[i].date.month = 12;
    //         attendance[i].date.year = 2024;
    //     }

    //     console.log({login: attendance[i].login, date: attendance[i].date})

    //     await attendance[i].save();

    // }

    res.send('quack')
    
});

module.exports = router;