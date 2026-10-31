(() => {
  "use strict";

  const page = (
    window.location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();

  const pages = {
    "index.html": {
      title: "Ideas Into Reality. Innovation Without Limits.",
      badge: "WELCOME TO FX DIGITAL",
      subtitle:
        "We turn bold ideas into meaningful digital experiences. Explore technology, creativity, and smarter solutions with FX Digital.",
      slogans: [
        "Ideas Into Reality.",
        "Innovation Without Limits.",
        "Build Something Extraordinary.",
        "Your Vision. Our Digital World."
      ]
    },

    "fx-web.html": {
      title: "Your Ideas Deserve a Better Website.",
      badge: "FX WEB",
      subtitle:
        "Modern websites. Memorable experiences. Digital identities built to stand out.",
      slogans: [
        "Design That Makes an Impression.",
        "Your Brand Deserves to Stand Out.",
        "From Ideas to Online Experiences."
      ]
    },

    "fx-docs.html": {
      title: "Tugas Selesai, Hati Santai!",
      badge: "FX DOCS",
      subtitle:
        "Deadline mendekat? Tetap kalem! Bantu urusan tugas dan dokumen jadi lebih rapi, praktis, dan terstruktur.",
      slogans: [
        "Tugas Selesai, Hati Santai!",
        "Deadline Mepet? Tetap Kalem!",
        "Dokumen Rapi, Pikiran Lebih Happy.",
        "Kerja Cerdas, Bukan Cuma Kerja Keras."
      ]
    },

    "fx-tech.html": {
      title: "Technology Made Simple.",
      badge: "FX TECH",
      subtitle:
        "Explore practical technology, smarter workflows, and digital solutions designed to make life easier.",
      slogans: [
        "Less Hassle. More Progress.",
        "Smarter Solutions Start Here.",
        "Technology That Works for You."
      ]
    },

    "fx-gaming.html": {
      title: "Game On. Level Up. Repeat.",
      badge: "FX GAMING",
      subtitle:
        "Explore gaming culture, creative game projects, and digital experiences made for curious minds.",
      slogans: [
        "Your Game. Your Style.",
        "Keep Playing. Keep Creating.",
        "From Player to Creator.",
        "Ready. Set. Game On."
      ]
    },

    "kontak.html": {
      title: "Let's Make Something Awesome.",
      badge: "LET'S CONNECT",
      subtitle:
        "Have a project, a question, or an idea worth exploring? Let's talk and find the right way forward.",
      slogans: [
        "Your Next Project Starts Here.",
        "One Message Can Start Something Great.",
        "Let's Turn Your Idea Into Action."
      ]
    }
  };

  const content = pages[page] || pages["index.html"];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Avoid duplicate execution.
  if (document.documentElement.dataset.fxModernLoaded === "true") {
    return;
  }

  document.documentElement.dataset.fxModernLoaded = "true";

  // Add floating background lights.
  if (!reduceMotion && document.body) {
    [
      "fx-orb fx-orb-purple",
      "fx-orb fx-orb-blue"
    ].forEach((className) => {
      const orb = document.createElement("div");

      orb.className = className;
      orb.setAttribute("aria-hidden", "true");

      document.body.appendChild(orb);
    });
  }

  // Modern opening text.
  // Existing content is preserved; the new introduction is inserted
  // only if it has not already been added.
  const main = document.querySelector("main");
  const heading = main
    ? main.querySelector("h1")
    : document.querySelector("h1");

  if (heading) {
    heading.classList.add("fx-gradient-text");

    if (!heading.dataset.fxOriginalText) {
      heading.dataset.fxOriginalText = heading.textContent.trim();
    }

    // Update the first heading to the page-specific headline.
    heading.textContent = content.title;
    heading.classList.add("fx-hero-enter");

    // Add badge and subtitle once.
    if (!document.querySelector(".fx-generated-intro")) {
      const intro = document.createElement("div");
      intro.className = "fx-generated-intro";

      const badge = document.createElement("div");
      badge.className = "fx-hero-badge";
      badge.textContent = content.badge;

      const subtitle = document.createElement("p");
      subtitle.className = "fx-hero-subtitle";
      subtitle.textContent = content.subtitle;

      const ticker = document.createElement("p");
      ticker.className = "fx-ticker";
      ticker.dataset.fxTicker = "true";
      ticker.textContent = content.slogans[0];
      ticker.setAttribute("aria-live", "polite");

      intro.append(badge, subtitle, ticker);

      heading.insertAdjacentElement("afterend", intro);
    }
  }

  // Animate elements when they enter the viewport.
  const candidates = document.querySelectorAll(
    "main section, main article, .service-card, .project-card, " +
    ".feature-card, .card, footer"
  );

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fx-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    candidates.forEach((element) => {
      if (!element.classList.contains("fx-reveal")) {
        element.classList.add("fx-reveal");
      }

      observer.observe(element);
    });
  } else {
    candidates.forEach((element) => {
      element.classList.add("fx-visible");
    });
  }

  // Rotate slogans.
  const ticker = document.querySelector("[data-fx-ticker]");

  if (
    ticker &&
    content.slogans.length > 1 &&
    !reduceMotion
  ) {
    let index = 0;

    window.setInterval(() => {
      ticker.classList.add("fx-changing");

      window.setTimeout(() => {
        index = (index + 1) % content.slogans.length;
        ticker.textContent = content.slogans[index];

        ticker.classList.remove("fx-changing");
      }, 250);
    }, 3200);
  }

  // Smooth navigation links.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.classList.add("fx-modern-link");
  });

  console.info("FX Digital modern effects loaded:", page);
})();
