const { getClient } = require("../util/database/dragonfly");

const attendanceSchema = require('../models/attendance');

async function daily() {
    let cacheClient = getClient();
    let keys = await cacheClient.keys('oz:assistance:*');

    let logins = keys.map(key => key.split(':')[2]);

    logins = logins.filter(login => login !== 'total');
    
    let total = await cacheClient.get('oz:assistance:total');

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
    
}

module.exports = {
    daily
};