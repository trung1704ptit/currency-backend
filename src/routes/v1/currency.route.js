const express = require('express');
const currencyControler = require('../../controllers/currency.controller');

const router = express.Router();

router.route('/').post(currencyControler.updateCurrency);
router.route('/').get(currencyControler.getSingleCurrency);
router.route('/rates').get(currencyControler.getCurrencyRates);

module.exports = router;
