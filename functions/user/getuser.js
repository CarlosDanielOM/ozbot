require('dotenv').config();

async function getUserByToken(token) {
    let headers = {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${token}`
    };

    try {
        let response = await fetch('https://api.twitch.tv/helix/users', {
            method: 'GET',
            headers: headers
        });

        if (response.status === 200) {
            let data = await response.json();
            return data.data[0];
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getUserByToken,
}