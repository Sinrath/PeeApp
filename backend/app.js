require('dotenv').config();
const express = require('express');
const peeRoutes = require('./routes/peeRoutes');
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 3500;

// Connect to MongoDB and start the server
connectDB()
    .then(() => {
        // Define routes
        app.use('/pee', peeRoutes);

        // Start the server
        app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    });