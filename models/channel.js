const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    login: String,
    name: String,
    email: String,
    type: { type: String, default: 'twitch' },
    user_id: String,
    user_token: String,
    user_refresh_token: String,
    daily_attendance: {type: Number, default: 3},
});

module.exports = mongoose.model('channel', channelSchema);