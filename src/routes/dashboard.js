const express = require('express');
const { requireLogin } = require('../middleware/auth');
const { getStore } = require('../store');

const router = express.Router();

router.get('/', requireLogin, (req, res) => {
  const orders = getStore('orders').filter(o => o.userId === req.session.userId).reverse();
  const tickets = getStore('tickets').filter(t => t.userId === req.session.userId).reverse();
  res.render('dashboard', { title: 'Dashboard', orders, tickets });
});

module.exports = router;
