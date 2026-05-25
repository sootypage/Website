const express = require('express');
const router = express.Router();
const { getStore } = require('../store');

router.get('/', (req, res) => {
  const plans = getStore('plans').filter(p => p.active).slice(0, 3);
  const reviews = getStore('reviews').filter(r => r.approved).slice(-3).reverse();
  res.render('index', { title: 'Home', plans, reviews });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

module.exports = router;
