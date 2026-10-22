const mongoose = require('mongoose');

const pricePointSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
});

pricePointSchema.index({ product: 1, date: 1 });

module.exports = mongoose.model('PricePoint', pricePointSchema);