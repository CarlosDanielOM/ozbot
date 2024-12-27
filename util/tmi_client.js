require('dotenv').config();
const tmi = require('tmi.js');

let client = null;

let options = {
    options: {
        debug: true
    },
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.BOT_PASSWORD
    },
    channels: ['ozbellvt']
}

async function clientConnect() {
    try {
        client = new tmi.client(options);
        await client.connect();

        client.on('connected', () => {
            console.log('Connected to IRC');
        });
    }
    catch (err) {
        console.error('Error connecting to IRC', err);
    }
}

function getClient() {
    return client;
}

module.exports = {
    clientConnect,
    getClient
};