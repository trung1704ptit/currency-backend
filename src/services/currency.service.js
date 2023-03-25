const { CurrencyPair, CurrencyRates } = require('../models');

/**
 * Create a currency
 * @param {Object} currencyBody
 * @returns {Promise<Currency>}
 */
const createCurrency = async (currencyBody) => {
  const result = CurrencyPair.create(currencyBody);
  return result;
};

const createCurrencyRates = async (base, currencyList) => {
  const result = await CurrencyRates.create({
    base,
    rates: currencyList,
  });

  return result;
};

/**
 * @param {ObjectId} pairName
 * @returns {Promise<Currency>}
 */
const getCurrencyByPairName = async (pairName) => {
  const data = await CurrencyPair.findOne({ pairName });

  if (data) return data;
  return null;
};

const getCurrencyRatesByBaseName = async (baseName, to) => {
  let data = await CurrencyRates.findOne({ base: baseName });

  if (data) {
    if (to) {
      data.rates = data.rates.filter((item) => item.to === to);
    }
    return data;
  }
  return null;
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

const updateCurrencyRates = async (base, currencyList) => {
  const currencyRates = await getCurrencyRatesByBaseName(base);
  if (!currencyRates) {
    return createCurrencyRates(base, currencyList);
  }
  await CurrencyRates.findOneAndUpdate({ base: base }, { $set: { rates: currencyList, lastUpdated: new Date() } });
};

/**
 *
 * @param {Object[]} currencies
 */

const updateCurrencyByBatch = (currencies) => {
  const groupByCategory = currencies.reduce((group, product) => {
    const { from } = product;
    group[from] = group[from] ?? [];
    group[from].push(product);
    return group;
  }, {});

  // currencies.forEach(async (item) => {
  //   await updateCurrencyByPairName(item.pairName, item);
  // });

  Object.keys(groupByCategory).forEach(async (key) => {
    await updateCurrencyRates(key, groupByCategory[key]);
  });
};

module.exports = {
  createCurrency,
  getCurrencyByPairName,
  updateCurrencyByPairName,
  updateCurrencyByBatch,
  getCurrencyRatesByBaseName,
};
