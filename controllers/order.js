const { validationResult } = require('express-validator');
const Order = require('../models/order');

exports.getOrdersByUserId = (req, res, next) => {
  Order.find({_user: req.userId})
    .populate('products._product')
    .then((orders) => {
      res.status(200).send({message: "success", orders: orders})
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      console.log(order);
      if (!order) {
        const error = new Error('Could not find order.');
        error.statusCode = 404;
        throw error;
      }
      if (order._user != req.userId) {
        const error = new Error('Unauthorized.');
        error.statusCode = 403;
        throw error;
      }
      res.status(200).json({ message: 'Order fetched.', order: order });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};