const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const currencyMapSchema = mongoose.Schema({
  base: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  mapping: [
    {
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
    },
  ],
  lastUpdated: {
    type: Date,
    default: new Date(),
  },
});

// add plugin that converts mongoose to json
currencyMapSchema.plugin(toJSON);

const CurrencyMap = mongoose.model('CurrencyMap', currencyMapSchema);
module.exports = CurrencyMap;
