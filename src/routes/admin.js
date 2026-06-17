const express = require('express');
const { nanoid } = require('nanoid');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const { getStore, saveStore } = require('../store');

const router = express.Router();

router.use(requireLogin, requireAdmin);

router.get('/', (req, res) => {
  res.render('admin', {
    title: 'Admin',
    plans: getStore('plans'),
    upgrades: getStore('upgrades'),
    serverTypes: getStore('serverTypes'),
    locations: getStore('locations'),
    orders: getStore('orders').slice().reverse(),
    tickets: getStore('tickets').slice().reverse(),
    reviews: getStore('reviews').slice().reverse(),
    users: getStore('users')
  });
});

router.post('/plans', (req, res) => {
  const plans = getStore('plans');
  const id = req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const plan = {
    id,
    name: req.body.name,
    type: req.body.type,
    description: req.body.description,
    ramGb: Number(req.body.ramGb || 0),
    cpuCores: Number(req.body.cpuCores || 0),
    storageGb: Number(req.body.storageGb || 0),
    backupSlots: Number(req.body.backupSlots || 0),
    subdomainSlots: Number(req.body.subdomainSlots || 0),
    extraPorts: Number(req.body.extraPorts || 0),
    priceMonthly: Number(req.body.priceMonthly || 0),
    active: req.body.active === 'on'
  };

  const index = plans.findIndex(p => p.id === id);
  if (index >= 0) plans[index] = plan;
  else plans.push(plan);

  saveStore('plans', plans);
  req.flash('success', 'Plan saved.');
  res.redirect('/admin#plans');
});

router.post('/plans/:id/hide', (req, res) => {
  const plans = getStore('plans');
  const plan = plans.find(p => p.id === req.params.id);
  if (plan) plan.active = false;
  saveStore('plans', plans);
  req.flash('success', 'Plan removed from the shop.');
  res.redirect('/admin#plans');
});

router.post('/plans/:id/show', (req, res) => {
  const plans = getStore('plans');
  const plan = plans.find(p => p.id === req.params.id);
  if (plan) plan.active = true;
  saveStore('plans', plans);
  req.flash('success', 'Plan added back to the shop.');
  res.redirect('/admin#plans');
});

router.post('/plans/:id/delete', (req, res) => {
  const plans = getStore('plans').filter(p => p.id !== req.params.id);
  saveStore('plans', plans);
  req.flash('success', 'Plan permanently deleted.');
  res.redirect('/admin#plans');
});

router.post('/upgrades', (req, res) => {
  const upgrades = getStore('upgrades');
  const id = req.body.id || nanoid();

  const upgrade = {
    id,
    name: req.body.name,
    kind: req.body.kind,
    amount: Number(req.body.amount || 0),
    priceMonthly: Number(req.body.priceMonthly || 0),
    active: req.body.active === 'on'
  };

  const index = upgrades.findIndex(u => u.id === id);
  if (index >= 0) upgrades[index] = upgrade;
  else upgrades.push(upgrade);

  saveStore('upgrades', upgrades);
  req.flash('success', 'Upgrade saved.');
  res.redirect('/admin#upgrades');
});

router.post('/upgrades/:id/delete', (req, res) => {
  const upgrades = getStore('upgrades').filter(u => u.id !== req.params.id);
  saveStore('upgrades', upgrades);
  req.flash('success', 'Upgrade deleted.');
  res.redirect('/admin#upgrades');
});

router.post('/tickets/:id/reply', (req, res) => {
  const tickets = getStore('tickets');
  const ticket = tickets.find(t => t.id === req.params.id);
  if (ticket) {
    ticket.adminReply = req.body.adminReply;
    ticket.status = req.body.status || 'open';
  }
  saveStore('tickets', tickets);
  req.flash('success', 'Ticket updated.');
  res.redirect('/admin#support');
});

router.post('/reviews/:id/approve', (req, res) => {
  const reviews = getStore('reviews');
  const review = reviews.find(r => r.id === req.params.id);
  if (review) review.approved = true;
  saveStore('reviews', reviews);
  req.flash('success', 'Review approved.');
  res.redirect('/admin#reviews');
});

router.post('/reviews/:id/delete', (req, res) => {
  const reviews = getStore('reviews').filter(r => r.id !== req.params.id);
  saveStore('reviews', reviews);
  req.flash('success', 'Review deleted.');
  res.redirect('/admin#reviews');
});

router.post('/server-types', (req, res) => {
  try {
    const serverTypes = getStore('serverTypes');
    const id = req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let variants = [];
    try {
      variants = JSON.parse(req.body.variants);
    } catch (err) {
      req.flash('error', 'Invalid JSON format for variants.');
      return res.redirect('/admin#server-types');
    }

    const serverType = {
      id,
      name: req.body.name,
      variants,
      active: req.body.active === 'on'
    };

    const index = serverTypes.findIndex(st => st.id === id);
    if (index >= 0) serverTypes[index] = serverType;
    else serverTypes.push(serverType);

    saveStore('serverTypes', serverTypes);
    req.flash('success', 'Server type saved.');
    res.redirect('/admin#server-types');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin#server-types');
  }
});

router.post('/server-types/:id/delete', (req, res) => {
  const serverTypes = getStore('serverTypes').filter(st => st.id !== req.params.id);
  saveStore('serverTypes', serverTypes);
  req.flash('success', 'Server type deleted.');
  res.redirect('/admin#server-types');
});

router.post('/locations', (req, res) => {
  const locations = getStore('locations');
  const id = req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const location = {
    id,
    name: req.body.name,
    description: req.body.description,
    priceMonthly: Number(req.body.priceMonthly || 0),
    active: req.body.active === 'on'
  };

  const index = locations.findIndex(l => l.id === id);
  if (index >= 0) locations[index] = location;
  else locations.push(location);

  saveStore('locations', locations);
  req.flash('success', 'Location saved.');
  res.redirect('/admin#locations');
});

router.post('/locations/:id/delete', (req, res) => {
  const locations = getStore('locations').filter(l => l.id !== req.params.id);
  saveStore('locations', locations);
  req.flash('success', 'Location deleted.');
  res.redirect('/admin#locations');
});

module.exports = router;
