const express = require('express');
const { nanoid } = require('nanoid');
const { requireLogin } = require('../middleware/auth');
const { getStore, saveStore } = require('../store');

const router = express.Router();

router.get('/', requireLogin, (req, res) => {
  const tickets = getStore('tickets').filter(t => t.userId === req.session.userId).reverse();
  res.render('support', { title: 'Support', tickets });
});

router.post('/', requireLogin, (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    req.flash('error', 'Please enter a subject and message.');
    return res.redirect('/support');
  }

  const users = getStore('users');
  const user = users.find(u => u.id === req.session.userId);
  const tickets = getStore('tickets');

  tickets.push({
    id: nanoid(),
    userId: user.id,
    username: user.username,
    email: user.email,
    subject,
    message,
    status: 'open',
    adminReply: '',
    createdAt: new Date().toISOString()
  });

  saveStore('tickets', tickets);
  req.flash('success', 'Support ticket sent.');
  res.redirect('/support');
});

module.exports = router;
