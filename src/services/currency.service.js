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
  const data = await Currency.findOne({ pairName });

  return data;
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
const updateCurrencyByBatch = (currencies) => {
  currencies.forEach(async (item) => {
    await updateCurrencyByPairName(item.pairName, item);
  });
};

module.exports = {
  createCurrency,
  getCurrencyByPairName,
  updateCurrencyByPairName,
  updateCurrencyByBatch,
};
