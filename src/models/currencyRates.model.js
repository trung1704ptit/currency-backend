const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const currencyMapSchema = mongoose.Schema({
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
currencyMapSchema.plugin(toJSON);

const CurrencyMap = mongoose.model('CurrencyMap', currencyMapSchema);
module.exports = CurrencyMap;
