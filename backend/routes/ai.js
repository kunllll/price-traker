const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product');
const PricePoint = require('../models/pricepoint');
const auth = require('../middleware/auth');
const { recommend } = require('../services/recommender');
const { withPricing } = require('./products');
const { generate } = require('../services/aiProvider');

const router = express.Router();
const FREE_DAILY_LIMIT = 5;

router.post('/chat', auth, async (req, res) => {
  const { message, productId } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

  const today = new Date().toISOString().slice(0, 10);
  const used = req.user.aiUsage?.date === today ? req.user.aiUsage.count : 0;
  if (req.user.plan === 'free' && used >= FREE_DAILY_LIMIT) {
    return res.status(429).json({
      error: `Free plan mein roz ${FREE_DAILY_LIMIT} AI sawal milte hain, aaj ke khatam. Unlimited ke liye Go Pro.`,
    });
  }

  let product = null, rec = null, alternatives = [];
  if (productId && mongoose.isValidObjectId(productId)) {
    const doc = await Product.findById(productId);
    if (doc) {
      product = withPricing(doc);
      const history = await PricePoint.find({ product: doc._id }).sort({ date: 1 }).select('price date -_id');
      rec = recommend(product.currentPrice, history);
      const same = await Product.find({ category: doc.category, _id: { $ne: doc._id } });
      alternatives = same
        .map(withPricing)
        .filter((a) => a.currentPrice < product.currentPrice)
        .sort((a, b) => b.currentPrice - a.currentPrice)
        .slice(0, 3);
    }
  }

  const context = product && {
    product: product.name,
    category: product.category,
    mrp: product.mrp,
    bestPrice: product.currentPrice,
    bestStore: product.bestStore,
    stores: product.stores.map((s) => ({ store: s.name, price: s.price, offer: s.offer, effective: s.effectivePrice })),
    priceStats: rec,
    cheaperAlternatives: alternatives.map((a) => ({ name: a.name, price: a.currentPrice })),
  };

  const prompt = `You are PriceIntel's shopping assistant for Indian shoppers.
Use ONLY the data below. Do not invent prices or products. If data is missing, say so.
Reply in Hinglish (Hindi in English letters), maximum 4 short sentences.
Start with a clear verdict (Buy now / Wait / Fair price) if the question is about buying.

DATA: ${context ? JSON.stringify(context) : 'No product selected.'}

USER QUESTION: ${message.trim()}`;

  const fallback = rec
    ? `${product.name}: ${rec.verdict.replace('_', ' ')}. ${rec.message} Best price ₹${product.currentPrice} (${product.bestStore}), average ₹${rec.avg}, low ₹${rec.min}.`
    : 'Pehle koi product select ya search kar, phir main uska price analysis bata dunga.';

  const reply = (await generate(prompt)) || fallback;

  if (product) {
    req.user.lastRecommendation = {
      product: product.name,
      text: reply.replace(/\s+/g, ' ').slice(0, 110),
      at: new Date(),
    };
  }
  req.user.aiUsage = { date: today, count: used + 1 };
  await req.user.save();

  res.json({
    reply,
    lastRecommendation: req.user.lastRecommendation?.text ? req.user.lastRecommendation : null,
  });
});

module.exports = router;