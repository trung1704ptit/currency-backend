const express = require('express');
const currencyControler = require('../../controllers/currency.controller');

const router = express.Router();

router.route('/').post(currencyControler.updateCurrency);
// router.route('/rates-socket').get(currencyControler.getSingleCurrency);
router.route('/rates').get(currencyControler.getCurrencyRates);
router.route('/converts').get(currencyControler.convertCurrency);

module.exports = router;
