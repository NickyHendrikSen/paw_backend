const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  const body = req.query;
  
  console.log("Test");
  return res.status(200).json(body);
};