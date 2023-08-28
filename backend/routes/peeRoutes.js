const express = require('express');
const Pee = require('../models/Pee');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/', async (req, res) => {
    console.log("Endpoint /pee POST accessed");
    const pee = new Pee({ time: new Date(), _id: new mongoose.Types.ObjectId() });
    try {
        await pee.save();
        res.json({ message: "Pee time saved", pee: pee });
    } catch (error) {
        res.status(500).json({ message: 'Error saving pee time', error: error });
    }
});



router.get('/', async (req, res) => {
    try {
        const peetimes = await Pee.find();
        res.json(peetimes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching peetimes' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const peeId = req.params.id;
        await Pee.findByIdAndDelete(peeId);
        res.send('Pee deleted!');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting pee' });
    }
});

module.exports = router;
