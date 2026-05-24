const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login/signup attempts. Please try again later.'
});

const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many checkout attempts. Please try again later.'
});

function safeRedirect(req, res, next) {
  res.safeRedirect = (target, fallback = '/') => {
    if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) return res.redirect(target);
    return res.redirect(fallback);
  };
  next();
}

module.exports = { generalLimiter, authLimiter, checkoutLimiter, safeRedirect };
