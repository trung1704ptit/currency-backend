const { CurrencyPair, CurrencyRates } = require('../models');
const redisClient = require('../redis');
const cron = require('node-cron');

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

cron.schedule('*/5 * * * *', async () => {
  try {
    // running a task every five minutes;
    let keys = await redisClient.keys('*');
    keys = keys.filter((k) => k !== 'ping');
    if (keys.length > 0) {
      keys.forEach(async (key) => {
        let cached = await redisClient.get(key);
        if (cached) {
          const existOnDB = await CurrencyRates.findOne({ from: key });
          if (existOnDB) {
            // update
            await CurrencyRates.findOneAndUpdate({ from: key }, { $set: { rates: cached.rates, lastUpdated: new Date() } });
          } else {
            // create new one
            createCurrencyRates(key, cached.rates);
          }
        }
      });
    }
    console.log('saved data into database');
  } catch (error) {
    console.log('Failed on cron job', error);
  }
});

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
  if (!from) {
    return null;
  }
  let data;
  const dataCached = await redisClient.get(from);
  if (dataCached) {
    data = JSON.parse(dataCached);
  } else {
    data = await CurrencyRates.findOne({ from });
  }

  if (data) {
    let rates = data.rates;
    if (to) {
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
  return null;
};

const convertCurrency = async (from, to, amount) => {
  if (from && to && amount) {
    let data;
    const dataCached = await redisClient.get(from);
    if (dataCached) {
      data = JSON.parse(dataCached);
    } else {
      data = await CurrencyRates.findOne({ from: from.toUpperCase() });
    }
    if (data) {
      const targetList = to
        .split(',')
        .filter((item) => item)
        .map((item) => item.toUpperCase());
      const rates = data.rates.filter((item) => targetList.includes(item.to.toUpperCase()));
      const converts = rates.map((item) => ({ ...item, amount, result: round(item.price * amount, 4) }));

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

  Object.keys(groupByCategory).forEach(async (key) => {
    const dataCached = { lastUpdated: new Date(), rates: groupByCategory[key] };
    redisClient.set(key, JSON.stringify(dataCached), 'EX', 5 * 60);
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
