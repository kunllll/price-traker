const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  plan: u.plan,
  lastRecommendation: u.lastRecommendation?.text ? u.lastRecommendation : null,
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: 'Name, email and password (min 6 characters) required' });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const user = await User.create({
    name: name.trim(),
    email,
    password: await bcrypt.hash(password, 10),
  });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = email && (await User.findOne({ email: email.toLowerCase() }));
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get('/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

// Demo upgrade: asli payment (Razorpay test mode) baad mein yahin lagega
router.post('/upgrade', auth, async (req, res) => {
  req.user.plan = 'pro';
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});

module.exports = router;