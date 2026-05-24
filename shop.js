const express = require('express');
const { nanoid } = require('nanoid');
const { requireLogin } = require('../middleware/auth');
const { checkoutLimiter } = require('../middleware/security');
const { getStore, saveStore } = require('../store');
const { calculateOrder, createStripeSession } = require('../billing');
const { decryptPanelPassword } = require('../auth');
const { provisionPanelServer } = require('../panelApi');

const router = express.Router();

router.get('/', (req, res) => {
  const plans = getStore('plans').filter(p => p.active);
  res.render('shop', { title: 'Shop', plans });
});

router.get('/checkout/:planId', requireLogin, (req, res) => {
  try {
    const plans = getStore('plans');
    const plan = plans.find(p => p.id === req.params.planId && p.active);
    const upgrades = getStore('upgrades').filter(u => u.active);
    if (!plan) {
      req.flash('error', 'Plan not found.');
      return res.redirect('/shop');
    }
    res.render('checkout', { title: 'Checkout', plan, upgrades });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/shop');
  }
});

router.post('/checkout/:planId', requireLogin, checkoutLimiter, async (req, res) => {
  try {
    const users = getStore('users');
    const user = users.find(u => u.id === req.session.userId);
    const upgradeIds = Array.isArray(req.body.upgrades)
      ? req.body.upgrades
      : req.body.upgrades ? [req.body.upgrades] : [];

    const { plan, selectedUpgrades, totalMonthly, resources } = calculateOrder(req.params.planId, upgradeIds);

    const orders = getStore('orders');
    const order = {
      id: nanoid(),
      userId: user.id,
      username: user.username,
      email: user.email,
      plan,
      upgrades: selectedUpgrades,
      resources,
      totalMonthly,
      status: process.env.STRIPE_SECRET_KEY ? 'pending_payment' : 'active',
      panelProvisionStatus: 'not_started',
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    saveStore('orders', orders);

    if (process.env.STRIPE_SECRET_KEY) {
      const session = await createStripeSession({ orderId: order.id, user, plan, upgrades: selectedUpgrades, totalMonthly });
      order.stripeSessionId = session.id;
      saveStore('orders', orders);
      return res.redirect(session.url);
    }

    const panelPayload = {
      orderId: order.id,
      username: user.username,
      email: user.email,
      password: decryptPanelPassword(user.panelPasswordEnc),
      plan,
      upgrades: selectedUpgrades,
      resources,
      totalMonthly
    };

    try {
      order.panelProvisionResult = await provisionPanelServer(panelPayload);
      order.panelProvisionStatus = order.panelProvisionResult.skipped ? 'skipped' : 'created';
    } catch (err) {
      order.panelProvisionStatus = 'failed';
      order.panelProvisionError = err.message;
    }

    saveStore('orders', orders);
    req.flash('success', 'Order created. You can see it in your dashboard.');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/shop');
  }
});

module.exports = router;
