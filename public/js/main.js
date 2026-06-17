// Flash message auto-hide
document.querySelectorAll('.flash').forEach((el) => {
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-4px)';
    el.style.transition = 'all .3s ease';
  }, 5000);
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
  mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenuToggle.textContent = '☰';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      navLinks.classList.remove('active');
      mobileMenuToggle.textContent = '☰';
    }
  });
}
