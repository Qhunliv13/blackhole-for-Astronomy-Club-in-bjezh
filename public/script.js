const form = document.querySelector('#schwarzschild-form');
const massInput = document.querySelector('#mass-input');
const radiusOutput = document.querySelector('#radius-output');
const currentYearEl = document.querySelector('#current-year');

const SCHWARZSCHILD_COEFFICIENT = 2.95;

function formatRadius(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)} 百万 km`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)} 千 km`;
  }
  return `${value.toFixed(2)} km`;
}

function updateRadius(mass) {
  const radius = mass * SCHWARZSCHILD_COEFFICIENT;
  radiusOutput.textContent = formatRadius(radius);
}

if (form && massInput) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const massValue = Number.parseFloat(massInput.value);
    if (Number.isNaN(massValue) || massValue <= 0) {
      radiusOutput.textContent = '请输入大于 0 的质量';
      return;
    }
    updateRadius(massValue);
  });

  updateRadius(Number.parseFloat(massInput.value));
}

if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  const fullpageContainer = document.querySelector('#fullpage');

  if (fullpageContainer && typeof fullpage !== 'undefined') {
    new fullpage('#fullpage', {
      licenseKey: 'gplv3-license',
      autoScrolling: true,
      scrollingSpeed: 700,
      navigation: true,
      navigationPosition: 'right',
      anchors: [
        'intro',
        'overview',
        'formation',
        'observations',
        'case-studies',
        'calculator',
        'simulations',
        'footer',
      ],
      menu: '#top-nav-menu',
      fixedElements: '#top-nav',
      keyboardScrolling: true,
      animateAnchor: true,
      responsiveWidth: 768,
    });

    const moveLinks = document.querySelectorAll('[data-move-to]');
    const prefersFullpage = () => window.innerWidth > 768 && typeof window.fullpage_api !== 'undefined';

    moveLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = link.getAttribute('data-move-to');
        if (!target) {
          return;
        }

        if (!prefersFullpage()) {
          return;
        }

        event.preventDefault();
        window.fullpage_api.moveTo(target);
      });
    });
  }

  const toggleFigure = document.querySelector('[data-gallery-toggle]');
  if (toggleFigure) {
    const img = toggleFigure.querySelector('img');
    const caption = toggleFigure.querySelector('figcaption');
    const primary = {
      src: toggleFigure.dataset.primarySrc,
      alt: toggleFigure.dataset.primaryAlt,
      caption: toggleFigure.dataset.primaryCaption,
    };
    const secondary = {
      src: toggleFigure.dataset.secondarySrc,
      alt: toggleFigure.dataset.secondaryAlt,
      caption: toggleFigure.dataset.secondaryCaption,
    };

    let isSecondary = false;
    let isAnimating = false;

    const applyData = (data) => {
      if (!img) {
        return;
      }
      if (data.src) {
        img.src = data.src;
      }
      img.alt = data.alt || '';
      if (caption) {
        caption.textContent = data.caption || '';
      }
    };

    applyData(primary);
    toggleFigure.setAttribute('aria-pressed', 'false');

    const swapImage = (data) => {
      if (!data || !data.src) {
        return;
      }
      isAnimating = true;
      toggleFigure.classList.add('is-transitioning');
      const loader = new Image();
      loader.src = data.src;
      loader.onload = () => {
        if (!img) {
          isAnimating = false;
          toggleFigure.classList.remove('is-transitioning');
          return;
        }
        img.src = loader.src;
        img.alt = data.alt || '';
        if (caption) {
          caption.textContent = data.caption || '';
        }
        requestAnimationFrame(() => {
          toggleFigure.classList.remove('is-transitioning');
          isAnimating = false;
        });
      };
    };

    const handleToggle = () => {
      if (isAnimating) {
        return;
      }
      isSecondary = !isSecondary;
      toggleFigure.setAttribute('aria-pressed', isSecondary.toString());
      swapImage(isSecondary ? secondary : primary);
    };

    toggleFigure.addEventListener('click', handleToggle);
    toggleFigure.addEventListener('keyup', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && !isAnimating) {
        event.preventDefault();
        handleToggle();
      }
    });
  }

  const timelineItems = document.querySelectorAll('.timeline__item');
  if (timelineItems.length) {
    const reveal = (entry, observer) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => reveal(entry, obs));
        },
        {
          threshold: 0.25,
          rootMargin: '0px 0px -10% 0px',
        },
      );

      timelineItems.forEach((item) => observer.observe(item));
    } else {
      timelineItems.forEach((item) => item.classList.add('is-visible'));
    }
  }

  const particleCanvas = document.querySelector('#simulation-particles');
  if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    const particles = [];
    const config = {
      count: 80,
      maxSpeed: 0.35,
      connectionDistance: 120,
      baseSize: 1.1,
    };

    const random = (min, max) => Math.random() * (max - min) + min;

    const createParticle = () => ({
      x: random(0, particleCanvas.width),
      y: random(0, particleCanvas.height),
      vx: random(-config.maxSpeed, config.maxSpeed),
      vy: random(-config.maxSpeed, config.maxSpeed),
      size: random(config.baseSize, config.baseSize + 1.1),
    });

    const resizeCanvas = () => {
      const parent = particleCanvas.parentElement;
      if (!parent) {
        return;
      }
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      particleCanvas.width = rect.width * dpr;
      particleCanvas.height = rect.height * dpr;
      particleCanvas.style.width = `${rect.width}px`;
      particleCanvas.style.height = `${rect.height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      particles.length = 0;
      const targetCount = Math.floor(config.count * (rect.width / 800 + rect.height / 800) / 2);
      for (let i = 0; i < Math.max(40, targetCount); i += 1) {
        particles.push(createParticle());
      }
    };

    const draw = () => {
      const width = particleCanvas.clientWidth;
      const height = particleCanvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) {
          p.vx *= -1;
        }
        if (p.y < 0 || p.y > height) {
          p.vy *= -1;
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(160, 185, 255, 0.75)';
        ctx.shadowColor = 'rgba(96, 123, 255, 0.45)';
        ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < config.connectionDistance) {
            const alpha = 1 - distance / config.connectionDistance;
            ctx.strokeStyle = `rgba(118, 142, 255, ${alpha * 0.4})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    window.addEventListener('resize', handleResize);
    resizeCanvas();
    requestAnimationFrame(draw);
  }
});

