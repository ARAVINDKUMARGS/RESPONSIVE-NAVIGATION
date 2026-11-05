/**
 * ============================================================================
 * AKGS – Editorial Creative Navigation Experience
 * Brand: Aravind Kumar GS | Meenakshi College of Engineering (Class of 2027)
 * Technology: Pure Vanilla JavaScript (ES6+) - Zero External Libraries
 * Features: Full-Screen Magazine Navigation, Live IST Clock, Scroll Tracker,
 *           IntersectionObserver Active Highlighting, Accessibility Focus Trap.
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Element Selectors & Application State
  // ==========================================================================
  const header = document.getElementById('header');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const overlayCloseBtn = document.getElementById('overlayCloseBtn');
  const overlayBrand = document.getElementById('overlayBrand');
  const overlayCta = document.getElementById('overlayCta');

  const desktopNavLinks = document.querySelectorAll('.editorial-nav .nav-anchor');
  const overlayLinks = document.querySelectorAll('.overlay-link');
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');

  const liveClock = document.getElementById('liveClock');
  const desktopClock = document.getElementById('desktopClock');

  const state = {
    isOverlayOpen: false,
    currentSectionId: 'home',
    scrollbarWidth: 0
  };

  // Calculate browser scrollbar width to prevent layout shift on body scroll lock
  const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth;
  state.scrollbarWidth = getScrollbarWidth();

  // ==========================================================================
  // 2. Live Chennai (IST) Clock
  // ==========================================================================
  const updateChennaiTime = () => {
    try {
      const now = new Date();
      // Format time in Asia/Kolkata timezone (Chennai, India)
      const options = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const formatter = new Intl.DateTimeFormat([], options);
      const timeStr = formatter.format(now);

      if (liveClock) liveClock.textContent = timeStr;
      if (desktopClock) desktopClock.textContent = timeStr;
    } catch {
      // Fallback if Intl.DateTimeFormat fails
      const d = new Date();
      const fallbackStr = d.toTimeString().split(' ')[0];
      if (liveClock) liveClock.textContent = fallbackStr;
      if (desktopClock) desktopClock.textContent = fallbackStr;
    }
  };

  setInterval(updateChennaiTime, 1000);
  updateChennaiTime();

  // ==========================================================================
  // 3. Scroll-Based Header Transitions & Progress Hairline
  // ==========================================================================
  let isTicking = false;

  const handleScrollEffects = () => {
    const scrollY = window.scrollY;

    // 1. Header Scrolled State
    if (scrollY > 30) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    // 2. Fine Progress Hairline
    if (scrollProgressBar) {
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalScrollable = docHeight - windowHeight;

      if (totalScrollable > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / totalScrollable) * 100));
        scrollProgressBar.style.width = `${progress}%`;
      } else {
        scrollProgressBar.style.width = '0%';
      }
    }

    isTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(handleScrollEffects);
      isTicking = true;
    }
  }, { passive: true });

  handleScrollEffects();

  // ==========================================================================
  // 4. Full-Screen Magazine Navigation Overlay
  // ==========================================================================
  const openOverlay = () => {
    if (state.isOverlayOpen) return;
    state.isOverlayOpen = true;

    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileOverlay.classList.add('is-active');
    mobileOverlay.setAttribute('aria-hidden', 'false');

    // Prevent body scrolling without layout shift
    state.scrollbarWidth = getScrollbarWidth();
    if (state.scrollbarWidth > 0) {
      document.body.style.paddingRight = `${state.scrollbarWidth}px`;
      if (header) header.style.paddingRight = `${state.scrollbarWidth}px`;
    }
    document.body.classList.add('no-scroll');

    // Focus close button for keyboard accessibility
    setTimeout(() => {
      if (overlayCloseBtn) overlayCloseBtn.focus();
    }, 150);
  };

  const closeOverlay = () => {
    if (!state.isOverlayOpen) return;
    state.isOverlayOpen = false;

    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileOverlay.classList.remove('is-active');
    mobileOverlay.setAttribute('aria-hidden', 'true');

    // Restore background scrolling
    document.body.classList.remove('no-scroll');
    document.body.style.paddingRight = '';
    if (header) header.style.paddingRight = '';

    // Return focus to menu trigger
    if (mobileMenuBtn) mobileMenuBtn.focus();
  };

  const toggleOverlay = () => {
    state.isOverlayOpen ? closeOverlay() : openOverlay();
  };

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleOverlay);
  if (overlayCloseBtn) overlayCloseBtn.addEventListener('click', closeOverlay);

  // Close overlay on link click
  overlayLinks.forEach((link) => {
    link.addEventListener('click', () => closeOverlay());
  });

  if (overlayBrand) overlayBrand.addEventListener('click', () => closeOverlay());
  if (overlayCta) overlayCta.addEventListener('click', () => closeOverlay());

  // Close overlay if clicking outside overlay inner container
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', (e) => {
      if (e.target === mobileOverlay) {
        closeOverlay();
      }
    });
  }

  // Keyboard accessibility: Escape key and Tab focus trap inside overlay
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (state.isOverlayOpen) {
        closeOverlay();
      }
    }
  });

  if (mobileOverlay) {
    mobileOverlay.addEventListener('keydown', (e) => {
      if (!state.isOverlayOpen || e.key !== 'Tab') return;

      const focusables = mobileOverlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    });
  }

  // ==========================================================================
  // 5. IntersectionObserver for Active Section Tracking
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');

  const updateActiveSection = (sectionId) => {
    if (state.currentSectionId === sectionId) return;
    state.currentSectionId = sectionId;

    // Desktop Nav Links
    desktopNavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Full-Screen Overlay Links
    overlayLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSection(entry.target.id);
      }
    });
  }, {
    root: null,
    rootMargin: '-20% 0px -55% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1.0]
  });

  sections.forEach((sec) => sectionObserver.observe(sec));

  // ==========================================================================
  // 6. Smooth Scrolling with Dynamic Sticky Header Offset
  // ==========================================================================
  allAnchorLinks.forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      if (!targetId) return;

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();

        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - headerHeight + 2;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        updateActiveSection(targetId);

        if (state.isOverlayOpen) {
          closeOverlay();
        }

        if (history.pushState) {
          history.pushState(null, null, `#${targetId}`);
        }
      }
    });
  });

  // ==========================================================================
  // 7. Responsive Window Resize Handling
  // ==========================================================================
  const desktopBreakpoint = window.matchMedia('(min-width: 1101px)');

  window.addEventListener('resize', () => {
    if (desktopBreakpoint.matches && state.isOverlayOpen) {
      closeOverlay();
    }
  });

  // ==========================================================================
  // 8. Console Brand Signature
  // ==========================================================================
  console.log(
    '%c AKGS %c Editorial Navigation Experience by Aravind Kumar GS %c',
    'background: #ff4d00; color: #ffffff; font-weight: bold; padding: 4px 8px;',
    'background: #111111; color: #f8f7f4; padding: 4px 8px; border-left: 2px solid #ff4d00;',
    'background: transparent;'
  );

});
