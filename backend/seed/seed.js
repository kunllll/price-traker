require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const PricePoint = require('../models/pricepoint');

// price = Amazon ka price, baaki stores isse derive honge
const items = [
 // Phones
  { name: 'Samsung Galaxy S24 FE', brand: 'Samsung', category: 'Phones', emoji: '📱', tagline: 'Powerful. Affordable. Exceptional.', mrp: 54999, price: 42999 },
  { name: 'Samsung Galaxy S25', brand: 'Samsung', category: 'Phones', emoji: '📱', tagline: 'AI that works for you.', mrp: 80999, price: 72999 },
  { name: 'Samsung Galaxy A55', brand: 'Samsung', category: 'Phones', emoji: '📱', tagline: 'Awesome, every day.', mrp: 39999, price: 29999 },
  { name: 'iPhone 16', brand: 'Apple', category: 'Phones', emoji: '📱', tagline: 'Apple intelligence is here.', mrp: 79900, price: 69999, inWatchlist: true },
  { name: 'iPhone 15', brand: 'Apple', category: 'Phones', emoji: '📱', tagline: 'Dynamic Island, 48MP camera.', mrp: 69900, price: 57999 },
  { name: 'OnePlus 13R', brand: 'OnePlus', category: 'Phones', emoji: '📱', tagline: 'Smooth beyond belief.', mrp: 44999, price: 42999 },
  { name: 'OnePlus Nord CE4', brand: 'OnePlus', category: 'Phones', emoji: '📱', tagline: 'Fast charging, fast everything.', mrp: 26999, price: 22999 },
  { name: 'Redmi Note 14 Pro', brand: 'Xiaomi', category: 'Phones', emoji: '📱', tagline: 'Pro camera, pro price.', mrp: 29999, price: 24999 },
  { name: 'Realme GT 6T', brand: 'Realme', category: 'Phones', emoji: '📱', tagline: 'Flagship speed for less.', mrp: 33999, price: 28999 },
  { name: 'Google Pixel 9', brand: 'Google', category: 'Phones', emoji: '📱', tagline: 'The best of Google AI.', mrp: 79999, price: 67999 },
  { name: 'Nothing Phone (2a)', brand: 'Nothing', category: 'Phones', emoji: '📱', tagline: 'Designed to be different.', mrp: 25999, price: 22999 },
  { name: 'Motorola Edge 50 Fusion', brand: 'Motorola', category: 'Phones', emoji: '📱', tagline: 'Curved display, clean Android.', mrp: 24999, price: 20999 },

  // Audio
  { name: 'Sony WH-1000XM5', brand: 'Sony', category: 'Audio', emoji: '🎧', tagline: 'Industry-leading noise cancelling.', mrp: 34990, price: 27999, inWatchlist: true },
  { name: 'Sony WF-1000XM5', brand: 'Sony', category: 'Audio', emoji: '🎧', tagline: 'Best-in-class true wireless.', mrp: 24990, price: 19999 },
  { name: 'Apple AirPods Pro 2', brand: 'Apple', category: 'Audio', emoji: '🎧', tagline: 'Rebuilt from the sound up.', mrp: 26900, price: 21999 },
  { name: 'boAt Airdopes 141', brand: 'boAt', category: 'Audio', emoji: '🎧', tagline: 'Long playback, low price.', mrp: 4490, price: 1299 },
  { name: 'boAt Rockerz 450', brand: 'boAt', category: 'Audio', emoji: '🎧', tagline: 'Bass-heavy wireless headphones.', mrp: 3990, price: 1499 },
  { name: 'JBL Flip 6', brand: 'JBL', category: 'Audio', emoji: '🔊', tagline: 'Bold sound, waterproof.', mrp: 14999, price: 9999 },
  { name: 'Bose QuietComfort Ultra', brand: 'Bose', category: 'Audio', emoji: '🎧', tagline: 'Immersive audio, world-class ANC.', mrp: 41900, price: 32999 },

  // Laptops
  { name: 'MacBook Air M3', brand: 'Apple', category: 'Laptops', emoji: '💻', tagline: 'Strikingly thin. Incredibly fast.', mrp: 114900, price: 89999, inWatchlist: true },
  { name: 'MacBook Pro 14 M4', brand: 'Apple', category: 'Laptops', emoji: '💻', tagline: 'Mind-blowing. Head-turning.', mrp: 169900, price: 149999 },
  { name: 'Dell Inspiron 15', brand: 'Dell', category: 'Laptops', emoji: '💻', tagline: 'Everyday performance.', mrp: 68000, price: 52999 },
  { name: 'HP Pavilion 15', brand: 'HP', category: 'Laptops', emoji: '💻', tagline: 'Style meets performance.', mrp: 72000, price: 58999 },
  { name: 'Lenovo IdeaPad Slim 3', brand: 'Lenovo', category: 'Laptops', emoji: '💻', tagline: 'Slim, light, student favourite.', mrp: 52000, price: 36999 },
  { name: 'ASUS TUF Gaming F15', brand: 'ASUS', category: 'Laptops', emoji: '💻', tagline: 'Built for gaming, built to last.', mrp: 89990, price: 64999 },

  // Tablets
  { name: 'iPad 10th Gen', brand: 'Apple', category: 'Tablets', emoji: '📲', tagline: 'Colorful and capable.', mrp: 39900, price: 29999 },
  { name: 'iPad Air M2', brand: 'Apple', category: 'Tablets', emoji: '📲', tagline: 'Serious performance, serious fun.', mrp: 59900, price: 49999 },
  { name: 'Samsung Galaxy Tab S9 FE', brand: 'Samsung', category: 'Tablets', emoji: '📲', tagline: 'Draw, note, play.', mrp: 36999, price: 27999 },

  // Watches
  { name: 'Samsung Galaxy Watch 7', brand: 'Samsung', category: 'Watches', emoji: '⌚', tagline: 'Health insights on your wrist.', mrp: 32999, price: 24999 },
  { name: 'Apple Watch Series 10', brand: 'Apple', category: 'Watches', emoji: '⌚', tagline: 'Thinner. Brighter. Smarter.', mrp: 46900, price: 42999 },
  { name: 'Noise ColorFit Pro 5', brand: 'Noise', category: 'Watches', emoji: '⌚', tagline: 'Big display, budget price.', mrp: 7999, price: 3499 },

  // Others
  { name: 'Sony PlayStation 5 Slim', brand: 'Sony', category: 'Gaming', emoji: '🎮', tagline: 'Play has no limits.', mrp: 54990, price: 46999 },
  { name: 'LG 55" 4K OLED TV', brand: 'LG', category: 'TVs', emoji: '📺', tagline: 'Perfect black, infinite contrast.', mrp: 149990, price: 94999 },
  { name: 'Mi 43" 4K Smart TV', brand: 'Xiaomi', category: 'TVs', emoji: '📺', tagline: 'Smart TV for every home.', mrp: 34999, price: 24999 },
  { name: 'Canon EOS R50', brand: 'Canon', category: 'Cameras', emoji: '📷', tagline: 'Mirrorless made simple.', mrp: 79995, price: 68999 },
];

const round10 = (n) => Math.round(n / 10) * 10;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await PricePoint.deleteMany({});

  const points = [];
  for (const it of items) {
    const p = await Product.create({
      name: it.name, brand: it.brand, category: it.category, emoji: it.emoji,
      tagline: it.tagline, mrp: it.mrp, inWatchlist: !!it.inWatchlist,
      stores: [
        { name: 'Amazon', price: it.price, offer: 2000, url: 'https://www.amazon.in' },
        { name: 'Flipkart', price: it.price + 500, offer: 1500, url: 'https://www.flipkart.com' },
        { name: 'Croma', price: it.price + 2000, offer: 1000, url: 'https://www.croma.com' },
      ],
    });

    // 180 din ki history: purane din mahenge, aaj current price tak girta hua
    const base = it.price - 2000; // best effective price
    for (let i = 180; i >= 0; i--) {
      const trend = base * 0.18 * (i / 180);
      const noise = base * (Math.random() * 0.03 - 0.015);
      const price = i === 0 ? base : round10(base + trend + noise);
      points.push({
        product: p._id,
        price,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      });
    }
  }

  await PricePoint.insertMany(points);
  console.log(`Seeded ${items.length} products, ${points.length} price points`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});