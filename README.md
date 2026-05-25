# OutbackServers Hosting Website

A Node.js/Express hosting shop website for selling game servers, VPS plans, Discord bot hosting, and website hosting.

It includes user login, signup, dashboard, shop plans, checkout, admin plan management, upgrades, support tickets, feedback/reviews, Stripe support, and a panel provisioning API hook.

## Features

### Public pages

- Home page
- Shop page
- Feedback/reviews page
- Login page
- Signup page
- Support page

### User features

- Create an account
- Log in and access dashboard
- Buy hosting plans
- Add upgrades at checkout
- View orders
- Open support tickets
- Leave reviews

### Admin features

- Create shop plans
- Add VPS plans
- Add game server plans
- Add Discord bot hosting plans
- Add website hosting plans
- Remove plans from the shop without deleting them
- Add removed plans back to the shop
- Permanently delete plans
- Create upgrades
- Delete upgrades
- View orders
- Reply to support tickets
- Approve/delete reviews

### Security added

- Helmet security headers
- Content Security Policy
- CSRF protection on forms
- Login/signup rate limiting
- Checkout rate limiting
- Secure session cookie settings
- HTTP-only cookies
- 8-hour session timeout
- Password hashing with bcrypt
- Encrypted stored panel password
- Basic signup validation
- Safe redirect helper
- Optional reverse proxy trust setting

## Requirements

- Node.js 18 or newer
- npm
- A domain if hosting publicly
- HTTPS for production
- Stripe account if you want real payments

## Install

```bash
git clone https://github.com/YOURUSERNAME/YOURREPO.git
cd YOURREPO
npm install
cp .env.example .env
npm start
```

Open:

```text
http://localhost:3000
```

## Environment setup

Edit `.env`:

```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
SITE_NAME=OutbackServers Hosting
TRUST_PROXY=false

SESSION_SECRET=change_this_to_a_very_long_random_secret_key_at_least_64_chars
APP_SECRET=change_this_to_32_or_more_random_chars_for_password_encryption

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

PANEL_API_URL=https://panel.outbackservers.example/api/admin/provision
PANEL_API_KEY=replace_with_your_panel_api_key
PANEL_LOGIN_URL=https://panel.outbackservers.example/login

SUPPORT_EMAIL=support@outbackservers.example
DISCORD_INVITE=https://discord.gg/yourinvite
```

## Admin login

The first admin account is created automatically on first start using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

After the website starts, go to:

```text
/admin
```

## Adding VPS plans

1. Log in as admin.
2. Go to `/admin`.
3. Find the **Plans** section.
4. Set **Type** to `VPS`.
5. Enter RAM, CPU, storage, price, and description.
6. Click **Save plan**.

The VPS plan will show on the shop page if **Active** is ticked.

## Removing items from the shop

From `/admin`, each plan has controls:

- **Remove from shop** hides it from customers.
- **Add to shop** makes it visible again.
- **Delete forever** permanently deletes it from the JSON file.

Using **Remove from shop** is safer than deleting because existing orders can still keep their old plan data.

## Stripe setup

If `STRIPE_SECRET_KEY` is blank, checkout runs in demo mode.

For real payments:

1. Add your Stripe secret key to `.env`.
2. Add a Stripe webhook endpoint:

```text
https://yourdomain.com/webhooks/stripe
```

3. Listen for this event:

```text
checkout.session.completed
```

4. Add the webhook signing secret to `.env`.

## Panel provisioning

When an order is paid or created in demo mode, the website sends a POST request to `PANEL_API_URL`.

Payload example:

```json
{
  "orderId": "abc123",
  "username": "customername",
  "email": "customer@example.com",
  "password": "same password used at signup",
  "plan": {
    "name": "VPS Starter",
    "type": "vps"
  },
  "upgrades": [],
  "resources": {
    "ramGb": 2,
    "cpuCores": 1,
    "storageGb": 30,
    "backupSlots": 1,
    "subdomainSlots": 0,
    "extraPorts": 3
  },
  "totalMonthly": 10
}
```

Your panel endpoint should create the panel user, server/VPS, resources, and upgrades.

## Data storage

This project uses JSON files in `/data`:

- `users.json`
- `plans.json`
- `upgrades.json`
- `orders.json`
- `tickets.json`
- `reviews.json`

For a bigger public hosting company, upgrade this to PostgreSQL or MySQL later.

## Production notes

Before going public:

- Set `NODE_ENV=production`
- Set `BASE_URL` to your real HTTPS domain
- Set `TRUST_PROXY=true` if using Cloudflare, Nginx Proxy Manager, or nginx
- Use strong random values for `SESSION_SECRET` and `APP_SECRET`
- Use HTTPS
- Set up Stripe webhooks
- Back up the `/data` folder
- Do not upload your real `.env` to GitHub
