const { validationResult } = require('express-validator');
const Order = require('../models/order');

exports.getOrdersByUserId = (req, res, next) => {
  const query = req.query;
  
  const minDate = query["min_date"];
  const maxDate = query["max_date"];
  const page = isNaN(query["page"]) ? 0 : query["page"]-1;
  const skip = 10;

  const filter = {_user: req.userId, ...(minDate || maxDate ? {createdAt: {
    ...(minDate ? {$gte: new Date(minDate)} : {}), 
    ...(maxDate ? {$lte: new Date(maxDate)} : {}), 
  }} : {}) };

  Order.find(filter)
    .populate('products._product')
    .sort('+createdAt')
    .skip(skip*page)
    .limit(skip)
    .then((orders) => {
      Order.countDocuments(filter)
      .then((count) => {
        res.status(200).send({message: "success", orders: orders, 
          pagination: {pageCount: Math.ceil(count/skip), count: count, skip: skip}
        })
      })
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
    .populate('products._product')
    .populate('_invoice')
    .then(order => {
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