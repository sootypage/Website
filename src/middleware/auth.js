const { getStore } = require('../store');

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    req.flash('error', 'You need to log in before doing that.');
    return res.redirect('/auth/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  const users = getStore('users');
  const user = users.find(u => u.id === req.session.userId);
  if (!user || user.role !== 'admin') {
    req.flash('error', 'Admin access required.');
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { requireLogin, requireAdmin };
