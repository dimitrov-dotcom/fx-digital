(() => {
  const init = () => {
    document.querySelectorAll('.navlinks').forEach((nav) => {
      const links = [...nav.querySelectorAll('a[data-nav]')];
      if (!links.length) return;

      let currentPage = window.location.pathname.split('/').pop();
      if (!currentPage) currentPage = 'index.html';

      const activeLink =
        links.find((link) => link.dataset.nav === currentPage) ||
        links.find((link) => link.getAttribute('href') === window.location.pathname);

      links.forEach((link) => {
        const active = link === activeLink;
        link.classList.toggle('active', active);
        if (active) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      let indicator = nav.querySelector('.fx-nav-indicator');
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'fx-nav-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        nav.prepend(indicator);
      }

      const moveIndicator = () => {
        const target = nav.querySelector('a[data-nav].active');
        if (!target) {
          indicator.style.opacity = '0';
          return;
        }

        const navRect = nav.getBoundingClientRect();
        const linkRect = target.getBoundingClientRect();

        indicator.style.left = `${linkRect.left - navRect.left + nav.scrollLeft}px`;
        indicator.style.top = `${linkRect.top - navRect.top + nav.scrollTop}px`;
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.height = `${linkRect.height}px`;
        indicator.style.opacity = '1';
      };

      // Atur posisi awal sebelum transisi pertama.
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) indicator.style.transition = 'none';
      moveIndicator();
      requestAnimationFrame(() => {
        moveIndicator();
        if (reducedMotion) {
          indicator.style.removeProperty('transition');
        }
      });

      window.addEventListener('resize', moveIndicator, { passive: true });
      nav.addEventListener('scroll', moveIndicator, { passive: true });
      window.addEventListener('pageshow', moveIndicator);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
