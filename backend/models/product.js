const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  { name: String, price: Number, offer: Number, url: String },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    brand: String,
    category: String,
    emoji: String,
    tagline: String,
    mrp: Number,
    stores: [storeSchema],
    inWatchlist: { type: Boolean, default: false }, // auth aane par user-based hoga
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);