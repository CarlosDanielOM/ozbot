const mongoose = require('mongoose');

const attendenceSchema = new mongoose.Schema({
    login: String,
    present: Number,
    total: Number,
    timestamp: {type: Number, default: Date.now()},
    date: {
        day: { type: Number, default: () => new Date().getDate() - 1 },
        month: { type: Number, default: () => new Date().getMonth() + 1 },
        year: { type: Number, default: () => new Date().getFullYear() }
    }
});

module.exports = mongoose.model('attendance', attendenceSchema);