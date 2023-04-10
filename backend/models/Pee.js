const mongoose = require('mongoose');

const peeSchema = new mongoose.Schema({
    time: Date,
    _id: mongoose.Schema.Types.ObjectId,
});

const Pee = mongoose.model('Pee', peeSchema);

module.exports = Pee;
