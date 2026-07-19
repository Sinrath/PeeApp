const express = require('express');
const Pee = require('../models/Pee');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/', async (req, res) => {
    const pee = new Pee({ time: new Date(), _id: new mongoose.Types.ObjectId() });
    try {
        await pee.save();
        res.json({ message: "Pee time saved", pee: pee });
    } catch (error) {
        console.error('Error saving pee time:', error);
        res.status(500).json({ message: 'Error saving pee time' });
    }
});

router.get('/', async (req, res) => {
    try {
        const peetimes = await Pee.find().sort({ time: -1 });
        res.json(peetimes);
    } catch (error) {
        console.error('Error fetching peetimes:', error);
        res.status(500).json({ message: 'Error fetching peetimes' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const peeId = req.params.id;
        await Pee.findByIdAndDelete(peeId);
        res.send('Pee deleted!');
    } catch (error) {
        console.error('Error deleting pee:', error);
        res.status(500).json({ message: 'Error deleting pee' });
    }
});

module.exports = router;
