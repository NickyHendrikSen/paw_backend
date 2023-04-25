const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  const query = req.query;
  
  const categories = query["categories"]?.split(",");
  const sort = query["sort"];
  const search = new RegExp(query["search"], 'i');

  const availableSort = ["date_desc", "date_asc", "name_asc", "name_desc", "price_asc", "price_desc"];

  Product.find({...(categories && {_category: categories}), name: {$regex: search}})
    .populate("_category")
    .sort(availableSort.indexOf(sort) ? [[sort.split("_")[0], sort.split("_")[1]]] : {}).then((products) => {
    return res.status(200).send(products);
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .populate("_category")
    .then(product => {
      if (!product) {
        const error = new Error('Could not find product.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Product fetched.', product: product });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};