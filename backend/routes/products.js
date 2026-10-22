const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product');
const PricePoint = require('../models/pricepoint');
const { recommend } = require('../services/recommender');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function withPricing(p) {
  const obj = p.toObject();
  obj.stores = obj.stores.map((s) => ({ ...s, effectivePrice: s.price - s.offer }));
  const best = obj.stores.reduce((a, b) => (a.effectivePrice <= b.effectivePrice ? a : b));
  obj.currentPrice = best.effectivePrice;
  obj.bestStore = best.name;
  obj.discountPercent = Math.round(((obj.mrp - obj.currentPrice) / obj.mrp) * 100);
  return obj;
}

// GET /api/products?q=iphone&category=Phones&watchlist=true
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.q) {
  const words = req.query.q.trim().split(/\s+/).filter(Boolean);
  filter.$and = words.map((w) => ({
    // har word ke beech optional space allow: "24fe" -> 2\s*4\s*f\s*e
    name: new RegExp(w.split('').map(escapeRegex).join('\\s*'), 'i'),
  }));
}
  if (req.query.category) filter.category = req.query.category;
  if (req.query.watchlist === 'true') filter.inWatchlist = true;

  const products = await Product.find(filter).sort({ name: 1 });
  res.json(products.map(withPricing));
});

// GET /api/products/:id?days=180  -> product + history + recommendation
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const days = Number(req.query.days) || 180;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const history = await PricePoint.find({ product: product._id, date: { $gte: since } })
    .sort({ date: 1 })
    .select('price date -_id');

  const data = withPricing(product);
  res.json({ ...data, history, recommendation: recommend(data.currentPrice, history) });
});

// PATCH /api/products/:id/watchlist  -> toggle
router.patch('/:id/watchlist', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.inWatchlist = !product.inWatchlist;
  await product.save();
  res.json({ id: product._id, inWatchlist: product.inWatchlist });
});

module.exports = router;
module.exports.withPricing = withPricing;