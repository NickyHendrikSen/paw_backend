const express = require('express');
const { check, body } = require('express-validator');

const orderController = require('../controllers/order');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/orders', isAuth, orderController.getOrdersByUserId);
router.get('/order/:orderId', isAuth, orderController.getOrder);

module.exports = router;