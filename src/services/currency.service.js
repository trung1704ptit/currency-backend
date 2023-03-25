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

const createCurrencyRates = async (from, currencyList) => {
  const result = await CurrencyRates.create({
    from,
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

const getCurrencyRatesByFrom = async (from, to) => {
  let data = await CurrencyRates.findOne({ from: from });

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

const updateCurrencyRates = async (from, currencyList) => {
  const currencyRates = await getCurrencyRatesByFrom(from);
  if (!currencyRates) {
    return createCurrencyRates(from, currencyList);
  }
  await CurrencyRates.findOneAndUpdate({ from }, { $set: { rates: currencyList, lastUpdated: new Date() } });
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
  getCurrencyRatesByFrom,
};
