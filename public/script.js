const form = document.querySelector('#schwarzschild-form');
const massInput = document.querySelector('#mass-input');
const radiusOutput = document.querySelector('#radius-output');
const currentYearEl = document.querySelector('#current-year');

const G = 6.6743e-11;
const C = 299792458;
const TON_TO_KG = 1000;
const rootElement = document.documentElement;
const baseDesktopScale = 0.5;
const tabletBreakpoint = 1024;
const minimumMobileScale = 0.45;

function formatRadiusMeters(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const abs = Math.abs(value);
  if (abs === 0) {
    return '0 m';
  }

  const UNITS = [
    { factor: 1e12, suffix: 'Tm' },
    { factor: 1e9, suffix: 'Gm' },
    { factor: 1e6, suffix: 'Mm' },
    { factor: 1e3, suffix: 'km' },
    { factor: 1, suffix: 'm' },
    { factor: 1e-3, suffix: 'mm' },
    { factor: 1e-6, suffix: 'µm' },
  ];

  for (const unit of UNITS) {
    if (abs >= unit.factor) {
      const scaled = value / unit.factor;
      if (Math.abs(scaled) >= 100) {
        return `${scaled.toFixed(1)} ${unit.suffix}`;
      }
      if (Math.abs(scaled) >= 1) {
        return `${scaled.toFixed(3)} ${unit.suffix}`;
      }
      return `${scaled.toPrecision(3)} ${unit.suffix}`;
    }
  }

  return `${value.toExponential(3)} m`;
}

function updateRadius(massTons) {
  const massKg = massTons * TON_TO_KG;
  const radiusMeters = (2 * G * massKg) / (C ** 2);
  radiusOutput.textContent = formatRadiusMeters(radiusMeters);
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

  const presetList = document.querySelector('#mass-presets');
  if (presetList) {
    presetList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-mass-tons]');
      if (!button) {
        return;
      }
      const presetMass = Number.parseFloat(button.dataset.massTons);
      if (!Number.isFinite(presetMass) || presetMass <= 0) {
        return;
      }
      massInput.value = presetMass;
      updateRadius(presetMass);
    });
  }

  updateRadius(Number.parseFloat(massInput.value));
}

if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

const applyGlobalScale = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  let scale = baseDesktopScale;
  if (width < tabletBreakpoint) {
    const widthRatio = width / 768;
    const heightRatio = height / 960;
    scale = Math.min(1, Math.max(minimumMobileScale, Math.min(widthRatio, heightRatio)));
  }
  rootElement.style.setProperty('--global-scale', scale.toFixed(3));
};

applyGlobalScale();

let resizeScaleFrame;
window.addEventListener('resize', () => {
  if (resizeScaleFrame) {
    cancelAnimationFrame(resizeScaleFrame);
  }
  resizeScaleFrame = requestAnimationFrame(applyGlobalScale);
});

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
      if (loader.complete) {
        loader.onload?.call(loader);
      }
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

  const initParticleField = (canvas, options = {}) => {
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    const {
      fullscreen = false,
      density = 0.00012,
      maxSpeed = 0.3,
      connectionDistance = 160,
      sizeRange = [1, 2],
      particleColor = 'rgba(160, 185, 255, 0.65)',
      glowColor = 'rgba(96, 123, 255, 0.35)',
      linkColor = 'rgba(118, 142, 255, {alpha})',
    } = options;

    const particles = [];
    let width = 0;
    let height = 0;
    let animationFrame;

    const random = (min, max) => Math.random() * (max - min) + min;

    const createParticle = () => ({
      x: random(0, width),
      y: random(0, height),
      vx: random(-maxSpeed, maxSpeed),
      vy: random(-maxSpeed, maxSpeed),
      size: random(sizeRange[0], sizeRange[1]),
    });

    const updateParticleCount = () => {
      const target = Math.max(30, Math.floor(width * height * density));
      particles.length = Math.min(particles.length, target);
      while (particles.length < target) {
        particles.push(createParticle());
      }
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = fullscreen
        ? { width: window.innerWidth, height: window.innerHeight }
        : canvas.parentElement?.getBoundingClientRect() || { width: 0, height: 0 };

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      particles.length = 0;
      updateParticleCount();
    };

    const draw = () => {
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
        ctx.fillStyle = particleColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
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
          if (distance < connectionDistance) {
            const alpha = 1 - distance / connectionDistance;
            ctx.strokeStyle = linkColor.replace('{alpha}', (alpha * 0.5).toFixed(3));
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        updateParticleCount();
      }, 120);
    };

    resizeCanvas();
    draw();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  };

  const sectionParticles = document.querySelectorAll('.section-particles');
  sectionParticles.forEach((canvas) => {
    const theme = canvas.dataset.section || 'dark';
    const isDark = theme === 'dark';
    initParticleField(canvas, {
      density: 0.00008,
      maxSpeed: 0.32,
      connectionDistance: isDark ? 150 : 120,
      sizeRange: [0.9, 2],
      particleColor: (() => {
        if (theme === 'light') {
          return 'rgba(30, 34, 56, 0.35)';
        }
        if (theme === 'accent') {
          return 'rgba(230, 206, 255, 0.75)';
        }
        return 'rgba(174, 192, 255, 0.8)';
      })(),
      glowColor: (() => {
        if (theme === 'light') {
          return 'rgba(98, 110, 160, 0.25)';
        }
        if (theme === 'accent') {
          return 'rgba(255, 160, 210, 0.48)';
        }
        return 'rgba(124, 148, 255, 0.5)';
      })(),
      linkColor: (() => {
        if (theme === 'light') {
          return 'rgba(64, 72, 112, {alpha})';
        }
        if (theme === 'accent') {
          return 'rgba(255, 184, 226, {alpha})';
        }
        return 'rgba(146, 168, 255, {alpha})';
      })(),
    });
  });

  const effectCanvases = document.querySelectorAll('.effect-particles');
  effectCanvases.forEach((canvas) => {
    const theme = canvas.dataset.section || 'dark';
    const isDark = theme === 'dark';
    initParticleField(canvas, {
      density: isDark ? 0.0001 : 0.00007,
      maxSpeed: isDark ? 0.28 : 0.23,
      connectionDistance: isDark ? 140 : 110,
      sizeRange: isDark ? [0.9, 1.8] : [0.7, 1.6],
      particleColor: isDark ? 'rgba(190, 206, 255, 0.75)' : 'rgba(35, 45, 78, 0.35)',
      glowColor: isDark ? 'rgba(128, 152, 255, 0.45)' : 'rgba(98, 112, 168, 0.25)',
      linkColor: isDark ? 'rgba(154, 180, 255, {alpha})' : 'rgba(74, 86, 130, {alpha})',
    });
  });
});

