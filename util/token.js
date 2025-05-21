require('dotenv').config();
const { getClient } = require('./database/dragonfly');
const channelSchema = require('../models/channel');

async function refreshToken(refreshToken) {
    if(!refreshToken) {
        return;
    }
    try {
        let cacheClient = getClient();
        let params = new URLSearchParams();
        params.append('client_id', process.env.CLIENT_ID);
        params.append('client_secret', process.env.CLIENT_SECRET);
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);

        let response = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        let data = await response.json();

        if(data.status === 400) {
            console.error('Error refreshing token', data);
            return;
        }

        let newToken = data.access_token;
        let newRefreshToken = data.refresh_token;

        cacheClient.hset('oz:data', 'token', newToken);
        cacheClient.hset('oz:data', 'refreshToken', newRefreshToken);

        let ozLogin = await cacheClient.hget('oz:data', 'login');

        let doc = await channelSchema.findOne({ login: ozLogin });

        if(!doc) {
            return;
        }

        doc.user_token = newToken;
        doc.user_refresh_token = newRefreshToken;

        await doc.save();
        
    }
    catch (err) {
        console.error('Error refreshing token', err);
    }
}

module.exports = {
    refreshToken
};