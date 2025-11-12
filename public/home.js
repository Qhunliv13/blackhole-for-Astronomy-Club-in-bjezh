(function () {
  const root = document.documentElement;
  const navElement = document.getElementById("home-nav");
  const navToggle = navElement ? navElement.querySelector(".home-nav__toggle") : null;
  const navLinksContainer = document.getElementById("home-nav-links");
  const navLinks = Array.from(document.querySelectorAll('[data-nav-target]'));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const slides = Array.from(document.querySelectorAll(".swiper-slide"));
  const pages = slides.map((slide, index) => {
    const key = slide.dataset.page || `page-${index}`;
    slide.dataset.page = key;
    return key;
  });

  const pageIndexMap = pages.reduce((accumulator, key, index) => {
    if (!(key in accumulator)) {
      accumulator[key] = index;
    }
    return accumulator;
  }, {});

  function setNavExpanded(expanded) {
    if (!navToggle || !navLinksContainer) {
      return;
    }
    navToggle.setAttribute("aria-expanded", String(expanded));
    navLinksContainer.classList.toggle("is-open", expanded);
  }

  function closeNav() {
    setNavExpanded(false);
  }

  if (navToggle && navLinksContainer) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      setNavExpanded(!expanded);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeNav();
      }
    });
  }

  function updateNavActiveLink(pageKey) {
    navLinks.forEach((link) => {
      const target = link.getAttribute("data-nav-target");
      if (target === pageKey) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  function setupNavLinkHandlers(swiperInstance) {
    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = link.getAttribute("data-nav-target");
        if (!target) {
          return;
        }
        const index = pageIndexMap[target];
        if (typeof index !== "number") {
          return;
        }
        if (link.hash && link.hash.startsWith("#")) {
          event.preventDefault();
        }
        swiperInstance.slideTo(index, 700);
        closeNav();
      });
    });
  }

  function setupScrollReveal() {
    const revealElements = Array.from(document.querySelectorAll(".home-section"));
    revealElements.forEach((element) => element.classList.add("scroll-reveal"));

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("scroll-reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-reveal-visible");
          } else {
            entry.target.classList.remove("scroll-reveal-visible");
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  function setupBackgroundDrift() {
    if (prefersReducedMotion.matches) {
      return;
    }

    const range = 24;
    let startX = 0;
    let startY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let startTime = 0;
    let duration = 0;

    function pickTarget() {
      startX = currentX;
      startY = currentY;
      targetX = (Math.random() * 2 - 1) * range;
      targetY = (Math.random() * 2 - 1) * range;
      startTime = performance.now();
      duration = 9000 + Math.random() * 6000;
    }

    function smoothStep(t) {
      return t * t * (3 - 2 * t);
    }

    function tick(now) {
      const elapsed = now - startTime;
      const progressRaw = Math.min(elapsed / duration, 1);
      const progress = smoothStep(progressRaw);
      currentX = startX + (targetX - startX) * progress;
      currentY = startY + (targetY - startY) * progress;
      document.body.style.setProperty("--home-bg-offset-x", `${currentX.toFixed(2)}px`);
      document.body.style.setProperty("--home-bg-offset-y", `${currentY.toFixed(2)}px`);

      if (progressRaw >= 1) {
        pickTarget();
      }
      requestAnimationFrame(tick);
    }

    pickTarget();
    requestAnimationFrame(tick);
  }

  function setupYear() {
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
      yearElement.textContent = String(new Date().getFullYear());
    }
  }

  const swiper = new Swiper(".home-swiper", {
    direction: "vertical",
    mousewheel: true,
    speed: 700,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  const paginationElement = document.querySelector(".swiper-pagination");
  if (paginationElement) {
    document.body.appendChild(paginationElement);
  }

  setupNavLinkHandlers(swiper);
  setupScrollReveal();
  setupBackgroundDrift();
  setupYear();

  function updateUrl(index) {
    const pageKey = pages[index];
    if (!pageKey) {
      return;
    }
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("page", pageKey);
    window.history.replaceState({}, "", newUrl);
  }

  swiper.on("slideChange", () => {
    const activeKey = pages[swiper.activeIndex];
    updateNavActiveLink(activeKey);
    updateUrl(swiper.activeIndex);
  });

  (function syncInitialState() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedPage = urlParams.get("page");
    if (requestedPage && requestedPage in pageIndexMap) {
      const index = pageIndexMap[requestedPage];
      swiper.slideTo(index, 0);
      updateUrl(index);
    }
    updateNavActiveLink(pages[swiper.activeIndex]);
  })();

  window.scrollToNextSection = function scrollToNextSection() {
    swiper.slideNext();
  };
})();

