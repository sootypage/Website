const express = require('express');
const { nanoid } = require('nanoid');
const { getStore, saveStore } = require('../store');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const reviews = getStore('reviews').filter(r => r.approved).reverse();
  res.render('reviews', { title: 'Feedback & Reviews', reviews });
});

router.post('/', requireLogin, (req, res) => {
  const { rating, message } = req.body;
  const users = getStore('users');
  const user = users.find(u => u.id === req.session.userId);
  const reviews = getStore('reviews');

  reviews.push({
    id: nanoid(),
    userId: user.id,
    username: user.username,
    rating: Number(rating || 5),
    message,
    approved: false,
    createdAt: new Date().toISOString()
  });

  saveStore('reviews', reviews);
  req.flash('success', 'Thanks. Your review is waiting for admin approval.');
  res.redirect('/reviews');
});

module.exports = router;
