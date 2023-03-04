// const httpStatus = require('http-status');
// const redis = require('redis');
const catchAsync = require('../utils/catchAsync');
const { currencyService } = require('../services');

// let redisClient;

// (async () => {
//   redisClient = redis.createClient();

//   redisClient.on('error', (error) => console.error(`Error : ${error}`));

//   await redisClient.connect();
// })();

const updateCurrency = catchAsync(async (req, res) => {
  const { currencies } = req.body;
  const io = req.app.get('socketio');

  currencies.forEach((currency) => {
    // redisClient.set(currency.pairName, JSON.stringify(currency));
    io.emit(currency.pairName, currency);
  });

  currencyService.updateCurrencyByBatch(currencies);

  res.send(200);
});

const handleSocketConnect = async (socket) => {
  const { query } = socket.handshake;
  // query in DB
  const cacheCurrency = await currencyService.getCurrencyByPairName(query.pairName);

  // if currency exists on DB, returns to client.
  if (cacheCurrency) {
    socket.emit(query.pairName, cacheCurrency);
  }
};

module.exports = {
  updateCurrency,
  handleSocketConnect,
};
