const CLIENT = require('../../util/tmi_client');
const DragonFlyDB = require('../../util/database/dragonfly');
const MongoDB = require('../../util/database/mongo');
const BOT = require('./bot');

async function init() {
    await MongoDB.init();
    await DragonFlyDB.init();
    await CLIENT.clientConnect();
    BOT.init();
}

init();