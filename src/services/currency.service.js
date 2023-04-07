const redisClient = require('../redis');

// const cron = require('node-cron');

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function groupByCategory(currencies) {
  const result = currencies.reduce((group, product) => {
    const { from } = product;
    group[from] = group[from] ?? [];
    group[from].push(product);
    return group;
  }, {});
  return result;
}

function mergeList(list1, list2) {
  list1.forEach((item, index) => {
    const finder = list2.find((val) => val.to === item.to);
    if (finder) {
      list1[index] = finder;
      list2 = list2.filter((val) => val.to !== finder.to);
    }
  });
  return list1;
}

// cron.schedule('*/5 * * * *', async () => {
//   try {
//     // running a task every five minutes;
//     let keys = await redisClient.keys('*');
//     keys = keys.filter((k) => k !== 'ping');
//     if (keys.length > 0) {
//       keys.forEach(async (key) => {
//         let cached = await redisClient.get(key);
//         cached = JSON.parse(cached);
//         if (cached) {
//           const existOnDB = await CurrencyRates.findOne({ from: key });
//           if (existOnDB) {
//             // update
//             await CurrencyRates.findOneAndUpdate(
//               { from: key },
//               { $set: { rates: cached.rates, lastUpdated: cached.lastUpdated } }
//             );
//           } else {
//             // create new one
//             await createCurrencyRates(key, cached.rates);
//           }
//         }
//       });
//     }
//     console.log('saved data into database');
//   } catch (error) {
//     console.log('Failed on cron job', error);
//   }
// });

/**
 * @param {ObjectId} pairName
 * @returns {Promise<Currency>}
 */
const getCurrencyByPairName = async (pairName) => {
  try {
    let data = null;
    if (!pairName) return data;

    const spliter = pairName.split('/');
    const dataCached = await redisClient.get(spliter[0]);
    if (dataCached) {
      data = JSON.parse(dataCached);
      data = data.rates.find((item) => item.to === to);
    }

    return data;
  } catch (error) {
    console.log('error in getCurrencyByPairName: ', error);
    return null;
  }
};

const getCurrencyRatesByFrom = async (from, to) => {
  try {
    if (!from) {
      return null;
    }
    let data;
    const dataCached = await redisClient.get(from);
    if (dataCached) {
      data = JSON.parse(dataCached);
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
  } catch (error) {
    console.log('Error in getCurrencyRatesByFrom: ', error);
    return null;
  }
};

const convertCurrency = async (from, to, amount) => {
  try {
    if (from && to && amount) {
      let data;
      const dataCached = await redisClient.get(from);
      if (dataCached) {
        data = JSON.parse(dataCached);
      }

      if (data) {
        const targetList = to
          .split(',')
          .filter((item) => item)
          .map((item) => item.toUpperCase());
        const rates = data.rates.filter((item) => targetList.includes(item.to.toUpperCase()));
        const converts = rates.map((item) => ({ ...item, amount, result: round(item.price * amount, 6) }));

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
  } catch (error) {
    console.log('error in convertCurrency: ', error);
    return null;
  }
};

/**
 *
 * @param {Object[]} currencies
 */
const updateCurrencyByBatch = async (currencies) => {
  try {
    currencies = groupByCategory(currencies);
    Object.keys(currencies).forEach(async (key) => {
      let rates = currencies[key];
      let prevRates = await clientRedis.get(key);

      if (prevRates) {
        prevRates = JSON.parse(prevRates).rates;
        rates = mergeList(currencies, prevRates)
      }
      // loop inside each of rates, update for each pair.

      const dataCached = { lastUpdated: new Date(), rates };

      // set key like: 'USD' with rates of 'USD'
      await redisClient.set(key, JSON.stringify(dataCached));
    });
  } catch (error) {
    console.log('error in updateCurrencyByBatch:', error);
  }
};

module.exports = {
  convertCurrency,
  getCurrencyByPairName,
  updateCurrencyByBatch,
  getCurrencyRatesByFrom,
};
