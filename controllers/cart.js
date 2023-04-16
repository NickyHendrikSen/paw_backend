const { validationResult } = require('express-validator');
const Product = require('../models/product');
const User = require('../models/user');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCart = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      user
        .populate('cart.items._product')
        .then(user => {
          const products = user.cart.items;
          res.status(200).send({message: "success", cart: products})
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

exports.deleteCart = (req, res, next) => {
  const prodId = req.params.productId;
  
  User.findById(req.userId)
    .then((user) => {
      Product.findById(prodId)
        .then(product => {
          if(!product) {
            const err = new Error("Product not found");
            err.httpStatusCode = 500;
            return next(err);
          };
          return user.removeFromCart(prodId);
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

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  User.findById(req.userId)
    .then((user) => {
    user
      .populate('cart.items._product')
      .then(user => {
        products = user.cart.items;
        total = 0;
        products.forEach(p => {
          total += p.quantity * p._product.price;
        });

        return stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          shipping_address_collection: {allowed_countries: ['US', 'CA']},
          shipping_options: [
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {amount: 500, currency: 'usd'},
                display_name: 'Flat rate Shipping',
                delivery_estimate: {
                  minimum: {unit: 'business_day', value: 3},
                  maximum: {unit: 'business_day', value: 7},
                },
              },
            },
          ],
          line_items: products.map(p => {
            return {
              name: p._product.name,
              description: p._product.category,
              amount: p._product.price * 100,
              currency: 'usd',
              quantity: p.quantity
            };
          }),
          success_url: process.env.FRONTEND_URL + '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
          // cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel={CHECKOUT_SESSION_ID}'
        });
      })
      .then(session => {
        user.checkout_session_id = session.id;
        user.save();
        return res.status(200).send({message: "success", data: {
          products: products,
          totalSum: total,
          sessionId: session.id}})
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