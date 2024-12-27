const mongoose = require('mongoose');

const listsSchema = new mongoose.Schema({
    name: String,
    list: Array
});

module.exports = mongoose.model('lists', listsSchema);