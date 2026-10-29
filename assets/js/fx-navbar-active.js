(() => {
  const links = document.querySelectorAll('.navlinks a[data-nav]');

  let currentPage = window.location.pathname.split('/').pop();
  if (!currentPage) currentPage = 'index.html';

  links.forEach((link) => {
    const target = link.getAttribute('data-nav');
    const isActive = target === currentPage;

    link.classList.toggle('active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
})();
