require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use(authRoutes);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout after 5s of not being able to connect
  })
  .then(result => {
    console.log("Connected");
    app.listen(8000);
  })
  .catch(err => {
    console.log("Error: " + err);
  });
