const express = require('express');
const Pee = require('../models/Pee');

const router = express.Router();

router.post('/', async (req, res) => {
    const pee = new Pee({ time: new Date() });
    await pee.save();
    res.send('Pee recorded!');
});

module.exports = router;
