const { validationResult } = require('express-validator');

const Product = require('../models/product');
const Category = require('../models/category');

exports.getProducts = (req, res, next) => {
  const query = req.query;
  
  const categories = query["categories"]?.split(",");
  const sort = query["sort"] ?? "name_asc";
  const search = new RegExp(query["search"], 'i');

  const page = isNaN(query["page"]) ? 0 : query["page"]-1;
  const skip = 10;

  const availableSort = [{"date_asc" : {date: 1}}, {"date_desc" : {date: -1}}, 
                        {"name_asc" : {name: 1}}, {"name_desc" : {name: -1}}, 
                        {"price_asc" : {price: 1}}, {"price_desc" : {price: -1}}];

  const filter = {name: {$regex: search}};
  const aggregateFilter = [{
    $lookup: {
        from: Category.collection.name,
        localField: "_category",
        foreignField: "_id",
        as: "_category"
    }
  }, {
    $unwind: "$_category"
  }, {
    $unwind: "$name"
  }, {
      $match: {
        ...(categories && {'_category.slug': { "$in": categories}})
        
      }
  }, {
    $match: {
      ...(filter && filter)
    }
  },
  {
    $sort : availableSort.find(x => sort in x)[sort] ?? {} 
  }
  ];

  Product
    .aggregate(aggregateFilter)
  // .findOne(filter)
    // .populate("_category")
    .skip(skip*page)
    .limit(skip)
    // .sort()
    .then((products) => {
      Product.aggregate([...aggregateFilter, {$count: "count"}])
      .then((result) => {
        const { count } = result[0] || 0;
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