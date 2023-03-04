const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const currencySchema = mongoose.Schema({
  pairName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
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
  status: {
    type: String,
    trim: true,
    default: '',
  },
  lastUpdated: {
    type: Date,
    default: new Date(),
  },
});

// add plugin that converts mongoose to json
currencySchema.plugin(toJSON);

const Currency = mongoose.model('Currency', currencySchema);
module.exports = Currency;
