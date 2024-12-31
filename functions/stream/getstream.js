const { getTwitchHelixUrl } = require("../../util/links");

async function getStream(token, channelID = null, channelName = null) {
    let headers = {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${token}`
    };

    let params = new URLSearchParams();

    if(channelName) {
        params.append('user_login', channelName);
    }

    if(channelID) {
        params.append('user_id', channelID);
    }

    try {
        let response = await fetch(getTwitchHelixUrl('streams', params), {
            method: 'GET',
            headers: headers,
        })
        
        if (response.status === 200) {
            let data = await response.json();
            return data.data[0];
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getStream
};