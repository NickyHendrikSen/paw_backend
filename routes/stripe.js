const express = require('express');
const { check, body } = require('express-validator');

const stripeController = require('../controllers/stripe');

const router = express.Router();

router.post('/stripe-webhook', stripeController.webhook);

module.exports = router;