const MONGODB = require('../../util/database/mongo');
const DragonFlyDB = require('../../util/database/dragonfly');
const { refreshToken } = require('../../util/token');
const { startTime } = require('../../util/timestarter');
const { assistance } = require('../../handlers/assistance');
const { endDayTimer } = require('../../util/endtimer');
const attendance_timer = require('../../util/attendancetimer')

const listSchema = require('../../models/lists');
const channelSchema = require('../../models/channel')

const { daily } = require('../../handlers/daily');
const { getStream } = require('../../functions/stream/getstream');

const threeHours = 1000 * 60 * 60 * 3;
const dayInMiliseconds = 1000 * 60 * 60 * 24;
let attendance_interval = threeHours;
let daily_attendance = 3;

async function init() {
    await MONGODB.init();
    await DragonFlyDB.init();

    let cacheClient = DragonFlyDB.getClient();

    let ozLogin = await cacheClient.hget('oz:data', 'login');
    let ozId = await cacheClient.hget('oz:data', 'id');
    let ozToken = await cacheClient.hget('oz:data', 'token');
    daily_attendance = await cacheClient.hget('oz:data', 'daily_attendance') ?? 3;
    daily_attendance = parseInt(daily_attendance);

    let ozData = null;

    if(!ozLogin || !ozId || !ozToken) {
        ozData = await channelSchema.findOne({ login: ozLogin });
        if(!ozData) {
            console.log('No ozbellgaming channel found');
            return;
        }
        await cacheClient.hset('oz:data', 'login', ozData.login);
        await cacheClient.hset('oz:data', 'id', ozData.user_id);
        await cacheClient.hset('oz:data', 'token', ozData.user_token);
        await cacheClient.hset('oz:data', 'refreshToken', ozData.user_refresh_token);

        ozLogin = ozData.login;
        ozId = ozData.user_id;
        ozToken = ozData.user_token;

        if(ozData.daily_attendance) {
            daily_attendance = ozData.daily_attendance;
            await cacheClient.hset('oz:data', 'daily_attendance', daily_attendance);
        }
    }
    
    let ozList = await listSchema.findOne({ name: ozLogin });

    if(!ozList) {
        ozList = {
            name: "ozbellgaming",
            list: []
        }
    }
    if(ozList.list.length == 0) {
        ozList.list = ['ozbellgaming'];
    }
    
    await cacheClient.sadd('oz:list', ozList.list);
    
    let ozRefreshToken = await cacheClient.hget('oz:data', 'refreshToken');
    
    setTimeout(async () => {
        await refreshToken(ozRefreshToken);
        console.log('Refreshed token');
    }, 1000 * 3);

    setInterval(async () => {
        let ozRefreshToken = await cacheClient.hget('oz:data', 'refreshToken');
        await refreshToken(ozRefreshToken);
        console.log('Refreshed token');
    }, 1000 * 60 * 60 * 3);

    let initialTime = startTime(daily_attendance);
    attendance_interval = await attendance_timer(daily_attendance);
    let endDayTime = endDayTimer();

    setTimeout(async () => {
        console.log('Starting timer');
        assistance();
        setInterval(async () => {
            console.log('Timer running');
            assistance();
            attendance_interval = await attendance_timer(daily_attendance);
        }, attendance_interval);
    }, initialTime);

    setTimeout(async () => {
        console.log('Starting end timer');
        daily();
        setInterval(async () => {
            console.log('End timer running');
            daily();
        }, dayInMiliseconds);
    }, endDayTime);

    const app = require('./server');
    const PORT = process.argv[2] || 3535;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

init();