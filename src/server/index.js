const MONGODB = require('../../util/database/mongo');
const DragonFlyDB = require('../../util/database/dragonfly');
const { refreshToken } = require('../../util/token');
const { startTime } = require('../../util/timestarter');
const { assistance } = require('../../handlers/assistance');

const listSchema = require('../../models/lists');

const threeHours = 1000 * 60 * 60 * 3;

async function init() {
    await MONGODB.init();
    await DragonFlyDB.init();

    let cacheClient = DragonFlyDB.getClient();

    let ozLogin = await cacheClient.hget('oz:data', 'login');
    
    let ozList = await listSchema.findOne({ name: ozLogin });

    cacheClient.sadd('oz:list', ozList.list);
    
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

    let initialTime = startTime();

    setTimeout(async () => {
        console.log('Starting timer');
        assistance();
        setInterval(async () => {
            console.log('Timer running');
            assistance();
        }, threeHours);
    }, initialTime);

    assistance();
    
    const app = require('./server');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

init();