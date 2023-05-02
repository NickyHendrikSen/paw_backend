const Category = require('../models/category');

exports.getCategories = (req, res, next) => {
  Category.find()
    .then((categories) =>{
      res.status(200).json({ message: 'Categories fetched.', categories: categories });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};