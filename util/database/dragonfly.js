require('dotenv').config();
const redis = require('ioredis');

let client = null;

module.exports = {
  init: async () => {
    client = new redis({
      host: process.env.DRAGONFLY_HOST,
      port: process.env.DRAGONFLY_PORT,
    });

    client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    client.on('connect', () => {
      console.log('Redis Client Connected');
    });
  },
  getClient: () => {
    return client;
  },
  close: () => {
    client.quit();
  }
};