const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/pee-app', { useNewUrlParser: true });

// Define a schema for pee data
const peeSchema = new mongoose.Schema({
    time: Date,
});

// Create a model for pee data based on the schema
const Pee = mongoose.model('Pee', peeSchema);

// Define a route to handle pee data
app.post('/pee', async (req, res) => {
    const pee = new Pee({ time: new Date() });
    await pee.save();
    res.send('Pee recorded!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
