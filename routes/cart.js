const express = require('express');
const { check, body } = require('express-validator');

const cartController = require('../controllers/cart');
const Product = require('../models/product');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/cart', isAuth, 
  [
    body('quantity')
      .isNumeric()
      .withMessage('Number field must be numeric')
      .custom((value) => {
        if (value <= 0) {
          throw new Error('Number field must be greater than 0');
        }
        return true;
      })
  ],
  cartController.addToCart);

router.get('/cart', isAuth, cartController.getCart);

// router.delete('/cart', isAuth, cartController.deleteCart);

module.exports = router;