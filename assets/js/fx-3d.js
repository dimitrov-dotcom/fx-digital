(() => {
  "use strict";

  if (window.__FX3D_INITIALIZED__) return;
  window.__FX3D_INITIALIZED__ = true;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* Add decorative grid without changing page content */
  if (!document.querySelector(".fx3d-grid")) {
    const grid = document.createElement("div");
    grid.className = "fx3d-grid";
    grid.setAttribute("aria-hidden", "true");
    document.body.prepend(grid);
  }

  /* 3D hover cards */
  const cards = document.querySelectorAll(
    ".hero-card, .card, .contact-card, " +
    ".fx-enhancement-card, .service-card, " +
    ".feature-card, .project-card, .fx-modern-card"
  );

  cards.forEach(card => {
    card.classList.add("fx3d-card");

    if (reduceMotion) return;

    card.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse") return;
      if (window.innerWidth <= 700) return;

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      card.style.setProperty("--fx3d-x", `${x * 100}%`);
      card.style.setProperty("--fx3d-y", `${y * 100}%`);

      const rotateY = (x - 0.5) * 7;
      const rotateX = (0.5 - y) * 6;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  /* Reveal content as it enters the screen */
  const revealTargets = document.querySelectorAll(
    "main section, main article, .fx-enhancement-section, " +
    ".fx-enhancement-card, footer"
  );

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("fx3d-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.10 });

    revealTargets.forEach(element => {
      element.classList.add("fx3d-reveal");
      observer.observe(element);
    });
  } else {
    revealTargets.forEach(element => {
      element.classList.add("fx3d-in");
    });
  }

  /* Lightweight animated particle field */
  if (reduceMotion) return;

  const canvas = document.createElement("canvas");
  canvas.id = "fx3d-particles";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    canvas.remove();
    return;
  }

  let width = 0;
  let height = 0;
  let particles = [];
  let frame = 0;
  let running = true;

  const pointer = { x: -1000, y: -1000 };
  const isMobile = () => window.innerWidth <= 700;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(
      isMobile() ? 24 : 58,
      Math.floor((width * height) / (isMobile() ? 24000 : 18000))
    );

    particles = Array.from({ length: Math.max(12, count) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.7 + .5
    }));
  }

  function draw() {
    if (!running || document.hidden) {
      frame = 0;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const linkDistance = isMobile() ? 85 : 125;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 110 && distance > 0) {
        p.x -= dx / distance * .18;
        p.y -= dy / distance * .18;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(103, 190, 255, .65)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const distanceBetween = Math.hypot(p.x - q.x, p.y - q.y);

        if (distanceBetween < linkDistance) {
          const alpha = (1 - distanceBetween / linkDistance) * .20;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(115, 105, 255, ${alpha})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }

    frame = window.requestAnimationFrame(draw);
  }

  function start() {
    if (!running || document.hidden || frame) return;
    frame = window.requestAnimationFrame(draw);
  }

  function stop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  window.addEventListener("resize", resize, { passive: true });

  window.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse") return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  start();

  console.info("FX DIGITAL 3D effects loaded");
})();
