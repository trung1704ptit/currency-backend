const express = require('express');
const currencyControler = require('../../controllers/currency.controller');

const router = express.Router();

router.route('/').post(currencyControler.updateCurrency);

module.exports = router;
