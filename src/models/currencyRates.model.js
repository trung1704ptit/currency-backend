const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const currencyRatesSchema = mongoose.Schema({
  from: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  rates: {
    type: mongoose.Mixed,
  },
  lastUpdated: {
    type: Date,
    default: new Date(),
  },
});

// add plugin that converts mongoose to json
currencyRatesSchema.plugin(toJSON);

const CurrencyRates = mongoose.model('CurrencyRates', currencyRatesSchema);
module.exports = CurrencyRates;
