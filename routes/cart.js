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
            console.log("test1");
          throw new Error('Number field must be greater than 0');
        }
        console.log("test");
        return true;
      })
  ],
  cartController.addToCart);
router.get('/cart', cartController.getCart);

module.exports = router;