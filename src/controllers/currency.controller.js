const catchAsync = require('../utils/catchAsync');
const { currencyService } = require('../services');

const updateCurrency = catchAsync(async (req, res) => {
  const { currencies } = req.body;
  const io = req.app.get('socketio');

  currencies.forEach((currency) => {
    if (io) {
      io.emit(currency.pairName, currency);
    }
  });

  currencyService.updateCurrencyByBatch(currencies);

  res.send(200);
});

const handleSocketConnect = catchAsync(async (socket) => {
  const { query } = socket.handshake;
  // query in DB
  const cacheCurrency = await currencyService.getCurrencyByPairName(query.pairName);
  if (cacheCurrency && socket) {
    socket.emit(query.pairName, cacheCurrency);
  }
});

// const getSingleCurrency = catchAsync(async (req, res) => {
//   const { query } = req;
//   const { from, to } = query;
//   const currencyData = await currencyService.getCurrencyByPairName(`${from}/${to}`);
//   res.send(currencyData);
// });

const getCurrencyRates = catchAsync(async (req, res) => {
  const { query } = req;
  const { from, to } = query;
  const currencyData = await currencyService.getCurrencyRatesByFrom(from, to);
  res.send(currencyData);
});

const convertCurrency = catchAsync(async (req, res) => {
  const { query } = req;
  const { from, to, amount } = query;
  const currencyData = await currencyService.convertCurrency(from, to, amount);
  res.send(currencyData);
});

module.exports = {
  updateCurrency,
  handleSocketConnect,
  // getSingleCurrency,
  getCurrencyRates,
  convertCurrency,
};
