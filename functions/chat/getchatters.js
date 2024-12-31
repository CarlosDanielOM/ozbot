const { getTwitchHelixUrl } = require('../../util/links');

require('dotenv').config();

async function getChatters(token, channelID) {
    let headers = {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${token}`
    };

    let params = new URLSearchParams();
    params.append('broadcaster_id', channelID);
    params.append('moderator_id', channelID);

    try {
        let response = await fetch(getTwitchHelixUrl('chat/chatters', params), {
            method: 'GET',
            headers: headers,
        })
        
        if (response.status === 200) {
            let data = await response.json();
            return data.data;
        }

        return {message: "Error getting chatters", status: response.status};
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getChatters,
}