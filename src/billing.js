const Stripe = require('stripe');
const { getStore } = require('./store');

function calculateOrder(planId, upgradeIds = []) {
  const plans = getStore('plans');
  const upgrades = getStore('upgrades');

  const plan = plans.find(p => p.id === planId && p.active);
  if (!plan) throw new Error('Plan not found.');

  const selectedUpgrades = upgrades.filter(u => upgradeIds.includes(u.id) && u.active);
  const totalMonthly = plan.priceMonthly + selectedUpgrades.reduce((sum, u) => sum + Number(u.priceMonthly || 0), 0);

  const resources = {
    ramGb: Number(plan.ramGb || 0),
    cpuCores: Number(plan.cpuCores || 0),
    storageGb: Number(plan.storageGb || 0),
    backupSlots: Number(plan.backupSlots || 0),
    subdomainSlots: Number(plan.subdomainSlots || 0),
    extraPorts: Number(plan.extraPorts || 0)
  };

  for (const up of selectedUpgrades) {
    if (Object.prototype.hasOwnProperty.call(resources, up.kind)) {
      resources[up.kind] += Number(up.amount || 0);
    }
  }

  return { plan, selectedUpgrades, totalMonthly, resources };
}

async function createStripeSession({ orderId, user, plan, upgrades, totalMonthly }) {
  if (!process.env.STRIPE_SECRET_KEY) return null;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    success_url: `${process.env.BASE_URL}/dashboard?paid=1`,
    cancel_url: `${process.env.BASE_URL}/shop/checkout/${plan.id}`,
    metadata: { orderId },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'aud',
          recurring: { interval: 'month' },
          unit_amount: Math.round(totalMonthly * 100),
          product_data: {
            name: `${plan.name}${upgrades.length ? ' + upgrades' : ''}`,
            description: upgrades.map(u => u.name).join(', ') || plan.description
          }
        }
      }
    ]
  });
}

module.exports = { calculateOrder, createStripeSession };
