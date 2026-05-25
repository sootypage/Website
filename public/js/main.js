document.querySelectorAll('.flash').forEach((el) => {
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-4px)';
    el.style.transition = 'all .3s ease';
  }, 5000);
});
