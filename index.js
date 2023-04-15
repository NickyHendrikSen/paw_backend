require('dotenv').config();

const path = require('path');

const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const stripeRoutes = require('./routes/stripe');

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(cors());

app.use(authRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(stripeRoutes);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use((error, req, res, next) => {
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
