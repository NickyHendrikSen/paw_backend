const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  const query = req.query;
  
  const categories = query["categories"]?.split(",");
  const sort = query["sort"];
  const search = new RegExp(query["search"], 'i');

  const page = isNaN(query["page"]) ? 0 : query["page"]-1;
  const skip = 10;

  const availableSort = ["date_desc", "date_asc", "name_asc", "name_desc", "price_asc", "price_desc"];

  const filter = {...(categories && {_category: categories}), name: {$regex: search}};

  Product.find(filter)
    .populate("_category")
    .skip(skip*page)
    .limit(skip)
    .sort(availableSort.indexOf(sort) ? [[sort.split("_")[0], sort.split("_")[1]]] : {})
    .then((products) => {
      Product.countDocuments(filter)
      .then((count) => {
        res.status(200).send({message: "success", products: products, 
          pagination: {pageCount: Math.ceil(count/skip), count: count, skip: skip}
        });
      })
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