const express = require('express');
const Stripe = require('stripe');
const { getStore, saveStore } = require('../store');
const { decryptPanelPassword } = require('../auth');
const { provisionPanelServer } = require('../panelApi');

const router = express.Router();

router.post('/stripe', async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send('Stripe webhooks are not configured.');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata.orderId;
      const orders = getStore('orders');
      const users = getStore('users');
      const order = orders.find(o => o.id === orderId);

      if (order) {
        const user = users.find(u => u.id === order.userId);
        order.status = 'active';

        if (user) {
          const payload = {
            orderId: order.id,
            username: user.username,
            email: user.email,
            password: decryptPanelPassword(user.panelPasswordEnc),
            plan: order.plan,
            upgrades: order.upgrades,
            resources: order.resources,
            totalMonthly: order.totalMonthly,
            serverConfig: order.serverConfig
          };

          try {
            order.panelProvisionResult = await provisionPanelServer(payload);
            order.panelProvisionStatus = order.panelProvisionResult.skipped ? 'skipped' : 'created';
          } catch (err) {
            order.panelProvisionStatus = 'failed';
            order.panelProvisionError = err.message;
          }
        }

        saveStore('orders', orders);
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
