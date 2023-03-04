const async = require('async');
const { Currency } = require('../models');

/**
 * Create a currency
 * @param {Object} currencyBody
 * @returns {Promise<Currency>}
 */
const createCurrency = async (currencyBody) => {
  return Currency.create(currencyBody);
};

/**
 * @param {ObjectId} pairName
 * @returns {Promise<Currency>}
 */
const getCurrencyByPairName = async (pairName) => {
  return Currency.findOne({ pairName });
};

/**
 * @param {ObjectId} pairName
 * @param {Object} currencyBody
 * @returns {Promise<Currency>}
 */
const updateCurrencyByPairName = async (pairName, currencyBody) => {
  const currency = await getCurrencyByPairName(pairName);
  if (!currency) {
    return createCurrency(currencyBody);
  }
  Object.assign(currency, currencyBody);
  await currency.save();
  return currency;
};

/**
 *
 * @param {Object[]} currencies
 */
const updateCurrencyByBatch = async (currencies) => {
  async.eachSeries(
    currencies,
    function updateObject(obj, done) {
      // Model.update(condition, doc, callback)
      Currency.updateOne({ pairName: obj.pairName }, { $set: { [obj.pairName]: obj } }, done);
    },
    function allDone(err) {
      if (err) {
        console.log('cannot update by batch');
      }
    }
  );
};

module.exports = {
  createCurrency,
  getCurrencyByPairName,
  updateCurrencyByPairName,
  updateCurrencyByBatch,
};
