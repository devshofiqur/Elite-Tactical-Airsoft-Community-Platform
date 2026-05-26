/* ===================================================
   BLACKSITE OPS — Main Script
   =================================================== */

$(document).ready(function () {

  /* ===================== PRELOADER ===================== */
  const statusMsgs = [
    "INITIALIZING SYSTEM...",
    "LOADING OPERATOR DATABASE...",
    "SYNCING FIELD NETWORK...",
    "ESTABLISHING COMMS...",
    "SYSTEM READY."
  ];
  let msgIdx = 0;
  const statusEl = document.getElementById('preloader-status');

  const msgInterval = setInterval(() => {
    msgIdx++;
    if (msgIdx < statusMsgs.length && statusEl) {
      statusEl.textContent = statusMsgs[msgIdx];
    } else {
      clearInterval(msgInterval);
    }
  }, 400);

  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('loaded');
    AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-quad' });
  }, 2200);


  /* ===================== NAV SCROLL ===================== */
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 50) {
      $('#mainNav').addClass('scrolled');
    } else {
      $('#mainNav').removeClass('scrolled');
    }

    /* Back to Top */
    if ($(this).scrollTop() > 400) {
      $('#backToTop').addClass('visible');
    } else {
      $('#backToTop').removeClass('visible');
    }

    /* Active Nav Link */
    const sections = ['hero', 'events', 'fields', 'marketplace', 'teams', 'media', 'guide', 'community', 'about', 'contact'];
    let current = '';
    sections.forEach(id => {
      const section = document.getElementById(id);
      if (section && $(this).scrollTop() >= section.offsetTop - 120) {
        current = id;
      }
    });
    $('.nav-link').removeClass('active');
    $(`.nav-link[href="#${current}"]`).addClass('active');
  });

  /* ===================== BACK TO TOP ===================== */
  $('#backToTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
  });

  /* Smooth scroll for anchor links */
  $('a[href^="#"]').on('click', function (e) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: target.offset().top - 70 }, 600);
      // Close mobile nav if open
      const navMenu = document.getElementById('navMenu');
      if (navMenu && navMenu.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navMenu);
        if (bsCollapse) bsCollapse.hide();
      }
    }
  });

  /* ===================== LANGUAGE SWITCHER ===================== */
  let currentLang = 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    // Update all elements with data-en / data-bg
    $('[data-en]').each(function () {
      const text = $(this).attr(`data-${lang}`);
      if (text) $(this).text(text);
    });

    // Update placeholders and options inside selects
    $('[data-en-placeholder]').each(function () {
      const ph = $(this).attr(`data-${lang}-placeholder`);
      if (ph) $(this).attr('placeholder', ph);
    });

    // Update lang btn state
    $('.lang-btn').removeClass('active');
    $(`.lang-btn[data-lang="${lang}"]`).addClass('active');
  }

  $(document).on('click', '.lang-btn', function () {
    const lang = $(this).data('lang');
    applyLanguage(lang);
  });

  /* ===================== MULTI-STEP FORM ===================== */
  window.goStep = function (step) {
    // Validate step 1
    if (step === 2) {
      const callsign = $('#callsign').val().trim();
      const email = $('#email').val().trim();
      if (!callsign) { shakeInput('#callsign'); return; }
      if (!email || !/\S+@\S+\.\S+/.test(email)) { shakeInput('#email'); return; }
    }

    // Update dots
    for (let i = 1; i <= 3; i++) {
      const dot = $(`.step-dot[data-step="${i}"]`);
      if (i < step) {
        dot.addClass('done').addClass('active');
      } else if (i === step) {
        dot.addClass('active').removeClass('done');
      } else {
        dot.removeClass('active').removeClass('done');
      }
    }

    // Update lines
    const lines = $('.step-line');
    lines.each(function (i) {
      if (i < step - 1) $(this).addClass('done');
      else $(this).removeClass('done');
    });

    // Update step label
    const labels = {
      1: currentLang === 'bg' ? 'СТЪПКА 1 / 3 — ПРОФИЛ НА ОПЕРАТОРА' : 'STEP 1 / 3 — OPERATOR PROFILE',
      2: currentLang === 'bg' ? 'СТЪПКА 2 / 3 — ДЕТАЙЛИ НА ЕДИНИЦАТА' : 'STEP 2 / 3 — UNIT DETAILS',
      3: currentLang === 'bg' ? 'СТЪПКА 3 / 3 — ФИНАЛЕН БРИФИНГ' : 'STEP 3 / 3 — FINAL BRIEFING',
    };
    $('#stepLabel').text(labels[step] || '');

    // Show correct step
    $('.reg-step').addClass('d-none');
    $(`#step${step}`).removeClass('d-none');
  };

  window.submitForm = function () {
    const terms = $('#terms').prop('checked');
    if (!terms) {
      shakeInput('#terms');
      return;
    }
    $('.reg-step').addClass('d-none');
    $('#stepSuccess').removeClass('d-none');
    // Reset dots to all done
    $('.step-dot').addClass('done active');
    $('.step-line').addClass('done');
  };

  function shakeInput(selector) {
    const el = $(selector).closest('.tac-input-group, .tac-checkbox');
    el.css('animation', 'none');
    setTimeout(() => {
      el.css('animation', 'shake 0.4s ease');
      setTimeout(() => el.css('animation', ''), 500);
    }, 10);
    $(selector).focus();
  }

  /* ===================== CONTACT FORM ===================== */
  window.sendMessage = function () {
    const btn = $('.contact-form-wrap .btn-tac-primary');
    const origText = btn.find('span').text();
    btn.find('span').text(currentLang === 'bg' ? 'ИЗПРАТЕНО!' : 'TRANSMITTED!');
    btn.css({ background: 'var(--olive)', borderColor: 'var(--olive)' });
    setTimeout(() => {
      btn.find('span').text(origText);
      btn.css({ background: '', borderColor: '' });
    }, 3000);
  };

  /* ===================== COUNTDOWN ===================== */
  function updateCountdowns() {
    const target = new Date('2026-06-15T08:00:00');
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      $('#countdown1').text('LIVE NOW');
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    $('#countdown1').text(`${days}D ${hours}H ${mins}M`);
  }
  updateCountdowns();
  setInterval(updateCountdowns, 60000);

  /* ===================== PARALLAX HERO ===================== */
  $(window).on('scroll', function () {
    const scrollY = $(this).scrollTop();
    const heroImg = $('.hero-bg-img');
    if (heroImg.length) {
      heroImg.css('transform', `translateY(${scrollY * 0.25}px)`);
    }
  });

  /* ===================== KEYBOARD SHORTCUT ===================== */
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      const navMenu = document.getElementById('navMenu');
      if (navMenu && navMenu.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navMenu);
        if (bsCollapse) bsCollapse.hide();
      }
    }
  });

});

/* ===================== CSS SHAKE ANIMATION ===================== */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();
