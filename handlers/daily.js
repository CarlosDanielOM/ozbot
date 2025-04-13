const { getClient } = require("../util/database/dragonfly");

const attendanceSchema = require('../models/attendance');

async function daily() {
    let cacheClient = getClient();

    //! Adds a 10 second delay in order to let attendance update first before deleting and savin in the database
    await new Promise(resolve => setTimeout(resolve, 10000));

    //? Put in users that did not attend the stream
    let list = await cacheClient.smembers('oz:list');
    let keys = await cacheClient.keys('oz:assistance:*');

    keys = keys.map(key => key.split(':')[2]);
    list = list.filter(user => !keys.includes(user));

    for(let i = 0; i < list.length; i++) {
        let user = list[i];

        await cacheClient.set(`oz:assistance:${user}`, 0);
    }
    
    keys = await cacheClient.keys('oz:assistance:*');

    let logins = keys.map(key => key.split(':')[2]);

    logins = logins.filter(login => login !== 'total');
    
    let total = await cacheClient.get('oz:assistance:total');

    total = parseInt(total);

    for(let login of logins) {
        let assistance = await cacheClient.get(`oz:assistance:${login}`);

        let doc = new attendanceSchema({
            login,
            present: assistance,
            total: total
        });

        await doc.save();
        await cacheClient.del(`oz:assistance:${login}`);
    }

    cacheClient.del('oz:assistance:total');

    //? Add a new list based on the list of users
    
    list = await cacheClient.smembers('oz:list');
    
    for(let i = 0; i < list.length; i++) {
        let user = list[i];
        
        await cacheClient.set(`oz:assistance:${user}`, 0);
    }

    console.log('Daily update');
}

module.exports = {
    daily
};