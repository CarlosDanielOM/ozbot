const express = require('express');
const router = express.Router();

const attendanceSchema = require('../../../models/attendance');
const channelSchema = require('../../../models/channel');
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

        await cacheClient.set(`oz:assistance:${user}`, 0);
    }
    
    res.send({list: list.length, keys: keys.length});
});

//? To be finished
router.get('/fix', async (req, res) => {
    let attendance = await attendanceSchema.find({'date.day': 31});
    let logins = attendance.map(user => user.login);

    for(let i = 0; i < attendance.length; i++) {
        
    }

    res.send({attendance: attendance.length, logins})
    
});

router.put('/intervals', async (req, res) => {
    let cacheClient = getClient();
    let body = req.body;

    if(!body.daily_attendance) {
        console.log('No daily attendance provided')
        res.send({status: 400, message: 'No daily attendance provided'});
        return;
    }

    if(typeof body.daily_attendance !== 'number') {
        console.log('Daily attendance must be a number')
        res.send({status: 400, message: 'Daily attendance must be a number'});
        return;
    }

    if(body.daily_attendance < 1) {
        console.log('Daily attendance must be greater than 0')
        res.send({status: 400, message: 'Daily attendance must be greater than 0'});
        return;
    }

    if(body.daily_attendance > 1440) {
        console.log('Daily attendance cannot be more than 1440')
        res.send({status: 400, message: 'Daily attendance cannot be more than 1440'});
        return;
    }

    try {
        console.log('Updating daily attendance')
        await cacheClient.hset('oz:data', 'daily_attendance', body.daily_attendance);
        await channelSchema.updateOne({login: 'ozbellvt'}, {$set: {daily_attendance: body.daily_attendance}});
    } catch (error) {
        console.log({error, where: 'Intervals change'})
        res.send({status: 500, message: 'Error updating daily attendance'});
        return;
    }

    console.log('Daily attendance updated');

    res.send({status: 200, message: 'Daily attendance updated'});
});

// Get all users with attendance records
router.get('/users', async (req, res) => {
    try {
        const cacheClient = getClient();
        const users = await cacheClient.smembers('oz:list');
        res.json({
            status: 200,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            status: 500,
            error: 'Internal server error' 
        });
    }
});

// Get weekly attendance statistics for a user
router.get('/weekly/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const weekOffset = parseInt(req.query.week) || 0; // Default to current week if not specified
        
        const today = new Date();
        const startOfWeek = new Date(today);
        
        // Adjust the start of week based on the offset
        startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
        
        // Get records for exactly 7 days
        const records = await attendanceSchema.find({
            login: username,
            'date.year': startOfWeek.getFullYear(),
            'date.month': startOfWeek.getMonth() + 1,
            'date.day': { $gte: startOfWeek.getDate(), $lte: startOfWeek.getDate() + 6 }
        }).sort({ 'date.day': 1 });

        // Calculate statistics
        const weeklyStats = {
            total_possible: 0,
            total_attended: 0,
            daily_stats: {}
        };

        // Initialize daily stats for exactly 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            weeklyStats.daily_stats[dayKey] = {
                attended: 0,
                possible: 0,
                percentage: 0,
                date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
            };
        }

        // Fill in the actual data
        records.forEach(record => {
            const date = new Date(record.date.year, record.date.month - 1, record.date.day);
            const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            weeklyStats.daily_stats[dayKey] = {
                attended: record.present,
                possible: record.total,
                percentage: (record.present / record.total) * 100,
                date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
            };
            weeklyStats.total_possible += record.total;
            weeklyStats.total_attended += record.present;
        });

        // Calculate overall percentage
        weeklyStats.overall_percentage = weeklyStats.total_possible > 0 
            ? (weeklyStats.total_attended / weeklyStats.total_possible) * 100 
            : 0;

        res.json({
            status: 200,
            data: weeklyStats
        });
    } catch (error) {
        console.error('Error fetching weekly attendance:', error);
        res.status(500).json({ 
            status: 500,
            error: 'Internal server error' 
        });
    }
});

module.exports = router;