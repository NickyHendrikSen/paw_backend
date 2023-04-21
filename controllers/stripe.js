const { validationResult } = require('express-validator');
const Order = require('../models/order');
const Invoice = require('../models/invoice');
const User = require('../models/user');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.webhook = (req, res, next) => {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object;
    
    User.findOne({checkout_session_id: checkoutSession?.id})
    .populate('cart.items._product')
    .then(user => {

      if(!user) {
        const error = new Error('Could not find user.');
        error.statusCode = 404;
        throw error;
      }
      
      let subtotal = 0;
      const products = user.cart.items.map(i => {
        subtotal+= i._product.price*i.quantity;
        return { quantity: i.quantity, _product: i._product._id, price: i._product.price };
      });

      const order = new Order({
        _user: user?._id,
        products: products,
        subtotal: subtotal,
        shipping: process.env.SHIPPING_PRICE,
        total: subtotal + parseInt(process.env.SHIPPING_PRICE),
        stripe_total: checkoutSession.amount_total/100,
        checkout_session: checkoutSession
      });
      const newOrder = order.save();
      if(newOrder) {
        // user.clearCart();
      }
      return newOrder;
    })
    .then(order => {
      console.log("order");
      const invoice = new Invoice({
        _order: order._id,
      });
      return invoice.save();
    })
    .then(invoice => {
      console.log("invoice");
      const order = Order.findOneAndUpdate({_id: invoice._order}, {_invoice: invoice._id}, {
        returnOriginal: false
      });
      return order;
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  }
};