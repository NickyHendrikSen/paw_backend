const express = require('express');
const { check, body } = require('express-validator');

const productController = require('../controllers/product');
const Product = require('../models/product');

const router = express.Router();

router.get('/products', productController.getProducts);
  
module.exports = router;