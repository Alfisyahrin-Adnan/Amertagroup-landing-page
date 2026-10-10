/* =====================================================
   Amerta Group — script.js
   ===================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ===== 0. DARK MODE =====
  const darkToggle = document.getElementById('dark-toggle');
  const darkIcon   = darkToggle.querySelector('.dark-toggle-icon');
  const html       = document.documentElement;

  // Tentukan tema awal:
  // Prioritas 1 — preferensi yang pernah disimpan user
  // Prioritas 2 — preferensi sistem operasi (prefers-color-scheme)
  const saved     = localStorage.getItem('amerta-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initDark  = saved ? saved === 'dark' : systemDark;

  function applyTheme(isDark) {
    if (isDark) {
      html.setAttribute('data-theme', 'dark');
      darkIcon.textContent = '☀️';
      darkToggle.setAttribute('aria-label', 'Ganti ke mode terang');
    } else {
      html.removeAttribute('data-theme');
      darkIcon.textContent = '🌙';
      darkToggle.setAttribute('aria-label', 'Ganti ke mode gelap');
    }
  }

  // Terapkan tema awal SEBELUM render (cegah flash)
  applyTheme(initDark);

  // Klik toggle
  darkToggle.addEventListener('click', () => {
    const nowDark = html.getAttribute('data-theme') === 'dark';
    applyTheme(!nowDark);
    localStorage.setItem('amerta-theme', !nowDark ? 'dark' : 'light');
  });

  // Ikuti perubahan tema OS secara real-time (jika user belum pernah pilih manual)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('amerta-theme')) {
      applyTheme(e.matches);
    }
  });


  // ===== 1. NAVBAR SCROLL SHADOW & MOBILE TOGGLE =====
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.getElementById('nav-links');
  const navToggle = document.getElementById('nav-toggle');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Tutup menu saat link diklik
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Tutup menu saat klik di luar navbar
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });


  // ===== 2. STATS COUNTER ANIMASI =====
  function animateCounter(el) {
    const target    = parseInt(el.dataset.target, 10);
    const duration  = 1800;
    const stepTime  = 16;
    const steps     = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString('id-ID');
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString('id-ID');
      }
    }, stepTime);
  }

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  if ('IntersectionObserver' in window && statNumbers.length) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statNumbers.forEach(el => counterObserver.observe(el));
  } else {
    // Fallback
    statNumbers.forEach(el => {
      el.textContent = parseInt(el.dataset.target, 10).toLocaleString('id-ID');
    });
  }


  // ===== 3. TENOR SELECTOR =====
  const tenorBtns  = document.querySelectorAll('.tenor-btn');
  const tenorInput = document.getElementById('loan-tenor');

  tenorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tenorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tenorInput.value = btn.dataset.value;
    });
  });


  // ===== 4. KALKULATOR PINJAMAN =====
  function formatRupiah(angka) {
    return 'Rp\u00A0' + Math.round(angka).toLocaleString('id-ID');
  }

  const btnCalculate      = document.getElementById('btn-calculate');
  const calcResult        = document.getElementById('calc-result');
  const resultContent     = calcResult.querySelector('.result-content');
  const resultPlaceholder = calcResult.querySelector('.result-placeholder');

  btnCalculate.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const tenor  = parseInt(tenorInput.value, 10);
    const rate   = parseFloat(document.getElementById('loan-type').value) / 100;

    if (!amount || amount < 1000000) {
      showInputError('loan-amount', 'Minimal pinjaman adalah Rp 1.000.000');
      return;
    }
    if (amount > 5000000000) {
      showInputError('loan-amount', 'Maksimal pinjaman adalah Rp 5.000.000.000');
      return;
    }

    const monthlyPrincipal = amount / tenor;
    const monthlyInterest  = amount * rate;
    const monthlyPayment   = monthlyPrincipal + monthlyInterest;
    const totalPayment     = monthlyPayment * tenor;
    const totalInterest    = totalPayment - amount;

    document.getElementById('monthly-payment').textContent = formatRupiah(monthlyPayment);
    document.getElementById('total-payment').textContent   = formatRupiah(totalPayment);
    document.getElementById('total-interest').textContent  = formatRupiah(totalInterest);
    document.getElementById('interest-rate').textContent   = (rate * 100).toFixed(2) + '%/bln';
    document.getElementById('result-tenor').textContent    = tenor + ' bulan';

    resultPlaceholder.classList.add('hidden');
    resultContent.classList.remove('hidden');

    if (window.innerWidth < 900) {
      setTimeout(() => {
        calcResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  });

  function showInputError(id, msg) {
    const input   = document.getElementById(id);
    const wrapper = input.closest('.input-wrap') || input;
    const group   = input.closest('.form-group');

    wrapper.style.borderColor = '#c0392b';
    input.focus();

    if (group && !group.querySelector('.error-msg')) {
      const err = document.createElement('span');
      err.className = 'error-msg';
      err.style.cssText = 'font-size:0.75rem;color:#c0392b;margin-top:4px;display:block;';
      err.textContent = msg;
      group.appendChild(err);
    }

    const clearError = () => {
      wrapper.style.borderColor = '';
      if (group) {
        const err = group.querySelector('.error-msg');
        if (err) err.remove();
      }
    };

    const t = setTimeout(clearError, 3000);
    input.addEventListener('input', () => { clearTimeout(t); clearError(); }, { once: true });
  }


  // ===== 5. FORM KONTAK =====
  const contactForm   = document.getElementById('contact-form');
  const btnSubmit     = document.getElementById('btn-submit');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const formSuccess   = document.getElementById('form-success');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('c-name').value.trim();
    const phone   = document.getElementById('c-phone').value.trim();
    const product = document.getElementById('c-product').value;

    if (!name) {
      highlightField('c-name', 'Nama tidak boleh kosong');
      return;
    }
    if (!phone || !/^0\d{8,12}$/.test(phone.replace(/\s/g, ''))) {
      highlightField('c-phone', 'Masukkan nomor WA/HP yang valid (cth: 08123456789)');
      return;
    }
    if (!product) {
      highlightField('c-product', 'Pilih produk yang diminati');
      return;
    }

    btnSubmit.disabled        = true;
    btnSubmitText.textContent = 'Mengirim...';

    setTimeout(() => {
      formSuccess.classList.remove('hidden');
      contactForm.reset();
      btnSubmit.disabled        = false;
      btnSubmitText.textContent = 'Kirim Pesan';

      setTimeout(() => formSuccess.classList.add('hidden'), 6000);
    }, 1200);
  });

  function highlightField(id, msg) {
    const field  = document.getElementById(id);
    const parent = field.closest('.form-group') || field.parentElement;

    field.style.borderColor = '#c0392b';
    field.focus();

    if (!parent.querySelector('.field-error')) {
      const span = document.createElement('span');
      span.className = 'field-error';
      span.style.cssText = 'font-size:0.75rem;color:#c0392b;display:block;margin-top:4px;';
      span.textContent = msg;
      parent.appendChild(span);
    }

    field.addEventListener('input', function cleanup() {
      this.style.borderColor = '';
      const err = parent.querySelector('.field-error');
      if (err) err.remove();
    }, { once: true });
  }


  // ===== 6. SMOOTH SCROLL (kompensasi navbar fixed) =====
  const navbarEl = document.getElementById('navbar');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return; // logo click, biarkan scroll ke atas normal
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const navH   = navbarEl.offsetHeight;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });


  // ===== 7. FADE-IN ANIMASI SAAT SCROLL =====
  // Gunakan CSS class, bukan inline style, agar tidak bertabrakan dengan CSS
  const fadeEls = document.querySelectorAll(
    '.service-card, .mitra-card, .calculator-form, .calculator-result, .contact-form, .info-card'
  );

  if ('IntersectionObserver' in window && fadeEls.length) {
    fadeEls.forEach(el => el.classList.add('fade-hidden'));

    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // requestAnimationFrame agar browser tidak skip transisi
          requestAnimationFrame(() => {
            entry.target.classList.remove('fade-hidden');
            entry.target.classList.add('fade-visible');
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(el => fadeObserver.observe(el));
  }

}); // end DOMContentLoaded
