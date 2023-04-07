const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  const query = req.query;
  
  const categories = query["categories"]?.split(",");
  const search = new RegExp(query["search"], 'i');

  Product.find({...(categories && {category: categories}), name: {$regex: search}}).then((products) => {
    return res.status(200).send(products);
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};