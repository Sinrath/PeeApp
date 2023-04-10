const mongoose = require('mongoose');

const peeSchema = new mongoose.Schema({
    time: Date,
});

const Pee = mongoose.model('Pee', peeSchema);

module.exports = Pee;
