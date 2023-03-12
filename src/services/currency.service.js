const { CurrencyPair, CurrencyMap } = require('../models');

/**
 * Create a currency
 * @param {Object} currencyBody
 * @returns {Promise<Currency>}
 */
const createCurrency = async (currencyBody) => {
  const result = CurrencyPair.create(currencyBody);
  return result;
};

const createCurrencyMap = async (base, currencyList) => {
  const result = await CurrencyMap.create({
    base,
    mapping: currencyList,
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

const getCurrencyMapByBaseName = async (baseName) => {
  const data = await CurrencyMap.findOne({ base: baseName });

  if (data) return data;
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

const updateCurrencyMap = async (base, currencyList) => {
  const currencyMap = await getCurrencyMapByBaseName(base);
  if (!currencyMap) {
    return createCurrencyMap(base, currencyList);
  }
  CurrencyMap.findOneAndUpdate({ base: base }, { $push: { mapping: currencyList } });
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

  currencies.forEach(async (item) => {
    await updateCurrencyByPairName(item.pairName, item);
  });

  Object.keys(groupByCategory).forEach(async (key) => {
    await updateCurrencyMap(key, groupByCategory[key]);
  });
};

module.exports = {
  createCurrency,
  getCurrencyByPairName,
  updateCurrencyByPairName,
  updateCurrencyByBatch,
  getCurrencyMapByBaseName,
};
