require('dotenv').config();
const mongoose = require('mongoose');

module.exports = {
    init: async () => {
        try {
            const dbOptions = {};
            mongoose.connect(process.env.MONGODB_URL, dbOptions);
            mongoose.Promise = global.Promise;
            
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB Connection Error: ', err);
            });
            mongoose.connection.on('connected', () => {
                console.log('MongoDB Connected');
            });
        }        
        catch (err) {
            console.error('MongoDB Connection Error: ', err);
        }
    },
    getDb: () => {
        return mongoose.connection;
    },
    close: () => {
        mongoose.connection.close();
    }
};