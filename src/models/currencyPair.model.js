const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const currencyPairSchema = mongoose.Schema({
  pairName: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  dayChanged: {
    type: Number,
    required: true,
    trim: true,
  },
  dayChangedByPercent: {
    type: Number,
    required: true,
    trim: true,
  },
  dayChangedStatus: {
    type: String,
    trim: true,
    default: '',
  },
  from: {
    type: String,
    required: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  lastUpdated: {
    type: Date,
    default: new Date(),
  },
});

// add plugin that converts mongoose to json
currencyPairSchema.plugin(toJSON);

const CurrencyPair = mongoose.model('CurrencyPair', currencyPairSchema);
module.exports = CurrencyPair;
