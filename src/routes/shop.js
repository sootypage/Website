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

router.get('/configure/:planId', requireLogin, (req, res) => {
  try {
    const plans = getStore('plans');
    const plan = plans.find(p => p.id === req.params.planId && p.active);
    const upgrades = getStore('upgrades').filter(u => u.active);
    const serverTypes = getStore('serverTypes');
    const locations = getStore('locations').filter(l => l.active);
    
    if (!plan) {
      req.flash('error', 'Plan not found.');
      return res.redirect('/shop');
    }
    
    res.render('configure', { title: 'Configure Server', plan, upgrades, serverTypes, locations });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/shop');
  }
});

router.post('/configure/:planId', requireLogin, (req, res) => {
  try {
    const { serverName, serverVariant, locationId, upgrades: upgradeIds } = req.body;
    
    if (!serverName || !serverVariant || !locationId) {
      req.flash('error', 'Please fill in all required fields.');
      return res.redirect(`/shop/configure/${req.params.planId}`);
    }

    // Store configuration in session for next step
    req.session.serverConfig = {
      serverName,
      serverVariant,
      locationId,
      upgradeIds: Array.isArray(upgradeIds) ? upgradeIds : (upgradeIds ? [upgradeIds] : [])
    };

    res.redirect(`/shop/checkout/${req.params.planId}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/shop');
  }
});

router.get('/checkout/:planId', requireLogin, (req, res) => {
  try {
    const plans = getStore('plans');
    const plan = plans.find(p => p.id === req.params.planId && p.active);
    const upgrades = getStore('upgrades').filter(u => u.active);
    const serverTypes = getStore('serverTypes');
    const locations = getStore('locations').filter(l => l.active);
    
    if (!plan) {
      req.flash('error', 'Plan not found.');
      return res.redirect('/shop');
    }

    // Check if configuration exists in session
    if (!req.session.serverConfig) {
      req.flash('error', 'Please configure your server first.');
      return res.redirect(`/shop/configure/${req.params.planId}`);
    }

    const { serverName, serverVariant, locationId, upgradeIds } = req.session.serverConfig;
    
    // Calculate order total
    const { selectedUpgrades, selectedLocation, totalMonthly, resources } = calculateOrder(req.params.planId, upgradeIds, locationId);

    // Find variant name for display
    let variantName = serverVariant;
    serverTypes.forEach(st => {
      const variant = st.variants.find(v => v.id === serverVariant);
      if (variant) variantName = `${st.name} - ${variant.name}`;
    });

    res.render('checkout', { 
      title: 'Checkout', 
      plan, 
      upgrades, 
      serverConfig: { serverName, serverVariant, locationId, variantName },
      selectedUpgrades,
      selectedLocation,
      totalMonthly,
      resources
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/shop');
  }
});

router.post('/checkout/:planId', requireLogin, checkoutLimiter, async (req, res) => {
  try {
    const users = getStore('users');
    const user = users.find(u => u.id === req.session.userId);
    
    // Get configuration from session
    if (!req.session.serverConfig) {
      req.flash('error', 'Please configure your server first.');
      return res.redirect(`/shop/configure/${req.params.planId}`);
    }

    const { serverName, serverVariant, locationId, upgradeIds } = req.session.serverConfig;

    const { plan, selectedUpgrades, selectedLocation, totalMonthly, resources } = calculateOrder(req.params.planId, upgradeIds, locationId);

    // Find variant name for storage
    let variantName = serverVariant;
    const serverTypes = getStore('serverTypes');
    serverTypes.forEach(st => {
      const variant = st.variants.find(v => v.id === serverVariant);
      if (variant) variantName = `${st.name} - ${variant.name}`;
    });

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
      serverConfig: {
        serverName,
        serverVariant,
        variantName,
        locationId,
        locationName: selectedLocation ? selectedLocation.name : 'Unknown'
      },
      status: process.env.STRIPE_SECRET_KEY ? 'pending_payment' : 'active',
      panelProvisionStatus: 'not_started',
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    saveStore('orders', orders);

    // Clear session config
    delete req.session.serverConfig;

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
      totalMonthly,
      serverConfig: order.serverConfig
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
