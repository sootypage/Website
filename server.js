require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const csrf = require('csurf');
const morgan = require('morgan');

const { ensureDataFiles, getStore } = require('./src/store');
const { createFirstAdmin } = require('./src/auth');
const { generalLimiter, safeRedirect } = require('./src/middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

ensureDataFiles();
createFirstAdmin();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (String(process.env.TRUST_PROXY).toLowerCase() === 'true') app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
      "connect-src": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(generalLimiter);
app.use(safeRedirect);
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  name: 'outbackservers.sid',
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(flash());

app.use((req, res, next) => {
  if (req.path === '/webhooks/stripe') return next();
  return csrf()(req, res, next);
});

app.use((req, res, next) => {
  const users = getStore('users');
  res.locals.currentUser = req.session.userId ? users.find(u => u.id === req.session.userId) : null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.locals.siteName = process.env.SITE_NAME || 'OutbackServers Hosting';
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
  next();
});

app.use('/', require('./src/routes/public'));
app.use('/auth', require('./src/routes/auth'));
app.use('/dashboard', require('./src/routes/dashboard'));
app.use('/shop', require('./src/routes/shop'));
app.use('/support', require('./src/routes/support'));
app.use('/reviews', require('./src/routes/reviews'));
app.use('/admin', require('./src/routes/admin'));
app.use('/webhooks', require('./src/routes/webhooks'));

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    req.flash('error', 'Security check failed. Please try again.');
    return res.redirect('back');
  }
  console.error(err);
  res.status(500).send('Server error');
});

app.use((req, res) => res.status(404).render('404', { title: 'Page not found' }));

app.listen(PORT, () => console.log(`OutbackServers Hosting website running on http://localhost:${PORT}`));
