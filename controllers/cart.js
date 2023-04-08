const { validationResult } = require('express-validator');
const Product = require('../models/product');
const User = require('../models/user');

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.addToCart = (req, res, next) => {
  const prodId = req.body.productId;
  const quantity = req.body.quantity || 1;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  
  User.findById(req.userId)
    .then((user) => {
      Product.findById(prodId)
        .then(product => {
          if(!product) {
            const err = new Error("Product not found");
            err.httpStatusCode = 500;
            return next(err);
          };
          return user.addToCart(product, quantity);
        })
        .then(result => {
          if(result) {
            res.status(200).send({message: "success", result: result})
          }
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};