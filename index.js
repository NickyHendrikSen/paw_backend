require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));

const MONGODB_URI = process.env.MONGODB_URI;

const authRoutes = require('./routes/auth');

app.use(authRoutes);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout after 5s of not being able to connect
  })
  .then(result => {
    console.log("test");
    app.listen(8000);
  })
  .catch(err => {
    console.log("Error: " + err);
  });
