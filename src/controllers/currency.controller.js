// const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const updateCurrency = catchAsync(async (req, res) => {
  const { currencies } = req.body;
  const io = req.app.get('socketio');

  currencies.forEach((currency) => {
    io.emit(currency.pairName, currency);
  });

  res.send(200);
});

const handleSocketConnect = catchAsync(async (socket) => {
  const { query } = socket.handshake;
  // do some query database
  socket.emit(query.pairName, {
    pairName: query.pairName,
    price: 1.111,
    dayChanged: 1.0001,
    dayChangedByPercent: 1.2342,
  });
});

module.exports = {
  updateCurrency,
  handleSocketConnect,
};
