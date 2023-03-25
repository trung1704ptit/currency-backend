const { CurrencyPair, CurrencyRates } = require('../models');
const { toArray } = require('lodash');
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
  console.log('from, to:', from, to)
  if (!from) {
    return null;
  }

  let data = await CurrencyRates.findOne({ from: from.toUpperCase() });
  console.log('data:', data);

  if (data) {
    let rates = [];
    if (to) {
      console.log(data)
      const targetList = to
        .split(',')
        .filter((item) => item)
        .map((item) => item.toUpperCase());
      rates = data.rates.filter((item) => targetList.includes(item.to.toUpperCase()));
    }
    return {
      success: true,
      from,
      to,
      rates,
    };
  }
  return {
    success: false,
    from,
    to,
    rates: [],
  };
};

const convertCurrency = async (from, to, amount) => {
  if (from && to && amount) {
    let data = await CurrencyRates.findOne({ from: from.toUpperCase() });

    if (data) {
      const targetList = to
        .split(',')
        .filter((item) => item)
        .map((item) => item.toUpperCase());
      const rates = data.rates.filter((item) => targetList.includes(item.to.toUpperCase()));
      const converts = rates.map((item) => ({ ...item, amount, result: item.price * amount }));

      return {
        success: true,
        from,
        to,
        amount,
        converts,
      };
    }
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
  convertCurrency,
  getCurrencyByPairName,
  updateCurrencyByPairName,
  updateCurrencyByBatch,
  getCurrencyRatesByFrom,
};
