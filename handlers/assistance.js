const { getChatters } = require("../functions/chat/getchatters");
const { getStream } = require("../functions/stream/getstream");
const { getClient } = require("../util/database/dragonfly");

async function assistance() {
    let cacheClient = getClient();
    let ozToken = await cacheClient.hget('oz:data', 'token');
    let ozID = await cacheClient.hget('oz:data', 'id');

    let stream = await getStream(ozToken, ozID);

    if(!stream) {
        return;
    }
    
    let chatters = await getChatters(ozToken, ozID);
    let chattersList = await cacheClient.smembers('oz:list');
    let selectedChatters = chattersList.filter(chatter => chatters.some(chatter2 => chatter2.user_login === chatter));

    selectedChatters.forEach(async chatter => {
        cacheClient.incr('oz:assistance:' + chatter);
    });

    cacheClient.incr('oz:assistance:total');
}

module.exports = {
    assistance
};