const express = require('express');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const { body, validationResult } = require('express-validator');
const { authLimiter } = require('../middleware/security');
const { getStore, saveStore } = require('../store');
const { encryptPanelPassword } = require('../auth');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', 'Please enter a valid email and password.');
    return res.redirect('/auth/login');
  }
  const { email, password } = req.body;
  const users = getStore('users');
  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/auth/login');
  }

  req.session.userId = user.id;
  req.flash('success', 'Logged in successfully.');
  res.redirect('/dashboard');
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign up' });
});

router.post('/signup', authLimiter, [
  body('username').trim().isLength({ min: 3, max: 32 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 200 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', 'Username must be 3-32 letters/numbers, and password must be at least 8 characters.');
    return res.redirect('/auth/signup');
  }
  const { username, email, password } = req.body;

  if (!username || !email || !password || password.length < 8) {
    req.flash('error', 'Please enter a username, email, and a password with at least 8 characters.');
    return res.redirect('/auth/signup');
  }

  const users = getStore('users');
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    req.flash('error', 'An account with that email already exists.');
    return res.redirect('/auth/signup');
  }

  const user = {
    id: nanoid(),
    username,
    email,
    passwordHash: bcrypt.hashSync(password, 12),
    panelPasswordEnc: encryptPanelPassword(password),
    role: 'user',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveStore('users', users);
  req.session.userId = user.id;
  req.flash('success', 'Account created.');
  res.redirect('/dashboard');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
