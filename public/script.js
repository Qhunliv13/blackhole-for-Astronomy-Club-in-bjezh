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

    const render = () => {
      if (!img) {
        return;
      }
      const data = isSecondary ? secondary : primary;
      if (data.src) {
        img.src = data.src;
      }
      if (data.alt) {
        img.alt = data.alt;
      }
      if (caption && data.caption) {
        caption.textContent = data.caption;
      }
      toggleFigure.setAttribute('aria-pressed', isSecondary.toString());
    };

    const handleToggle = () => {
      isSecondary = !isSecondary;
      render();
    };

    toggleFigure.addEventListener('click', handleToggle);
    toggleFigure.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    });

    render();
  }
});

