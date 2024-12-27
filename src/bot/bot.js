require('dotenv').config();
const CLIENT = require('../../util/tmi_client');

let client = null;

async function init() {
    let client = CLIENT.getClient();
}

module.exports = {
    init
};