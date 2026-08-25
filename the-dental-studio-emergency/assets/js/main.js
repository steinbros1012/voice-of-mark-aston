/* The Dental Studio — Emergency landing page
   Vanilla JS, no dependencies. Everything here is progressive enhancement:
   with JS disabled the page still reads, the phone links still dial, and the
   form still submits natively. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header shadow once scrolled ---------- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var drawer = document.getElementById('mobile-nav');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.setAttribute('data-open', String(open));
    document.body.classList.toggle('is-locked', open);
    if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      var first = drawer.querySelector('a, button');
      if (first) first.focus();
    } else if (openBtn) {
      openBtn.focus();
    }
  }

  if (openBtn) openBtn.addEventListener('click', function () { setDrawer(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });

  // Any link inside the drawer closes it before jumping to the section
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setDrawer(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drawer && drawer.getAttribute('data-open') === 'true') setDrawer(false);
  });

  // Keep focus inside the drawer while it is open
  if (drawer) {
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  // Close the drawer if the viewport grows past the desktop breakpoint
  var desktop = window.matchMedia('(min-width: 62em)');
  var onBreakpoint = function (e) { if (e.matches) setDrawer(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);

  /* ---------- Reserve exactly the sticky bar's height ----------
     --callbar-h pads <body> so the bar never covers the end of the footer.
     Measuring the real element keeps that correct when the label wraps or
     the device adds a safe-area inset. */
  var callbar = document.getElementById('callbar');
  if (callbar) {
    var syncCallbar = function () {
      var visible = getComputedStyle(callbar).display !== 'none';
      document.documentElement.style.setProperty(
        '--callbar-h', visible ? callbar.offsetHeight + 'px' : '0px');
    };
    syncCallbar();
    window.addEventListener('resize', syncCallbar, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(syncCallbar).observe(callbar);
  }

  /* ---------- "What to do now" accordions ---------- */
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.setAttribute('data-open', String(!open));
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Google Maps facade ----------
     The iframe is only fetched when someone asks for it, which keeps the
     third-party payload off the critical path. */
  var mapBtn = document.querySelector('[data-map-load]');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var wrap = mapBtn.closest('[data-map]');
      if (!wrap) return;
      var iframe = document.createElement('iframe');
      iframe.src = wrap.getAttribute('data-src');
      iframe.title = 'Map showing The Dental Studio at 9020 Senca Drive, Wilmington, NC 28411';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('allowfullscreen', '');
      wrap.appendChild(iframe);
      mapBtn.remove();
    });
  }

  /* ---------- Appointment form ----------
     Set FORM_ENDPOINT to the practice's form handler (Formspree, a CRM
     endpoint, a serverless function — anything that accepts a JSON POST).
     While it is empty the form validates and then points the visitor at the
     phone number, which is the fastest route in an emergency anyway. */
  var FORM_ENDPOINT = '';

  var form = document.getElementById('appointment-form');
  var status = document.getElementById('form-status');

  function fieldOf(input) { return input.closest('.field'); }

  function validate(input) {
    var wrap = fieldOf(input);
    if (!wrap) return true;

    var value = input.value.trim();
    var ok;
    if (input.required && value === '') {
      ok = false;                     // required and empty
    } else if (value === '') {
      ok = true;                      // optional and empty is fine
    } else {
      ok = input.checkValidity();     // non-empty: let the browser judge type/pattern
    }

    wrap.setAttribute('data-invalid', String(!ok));
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('blur', function () {
        if (fieldOf(input) && fieldOf(input).getAttribute('data-invalid') !== null) validate(input);
      });
      input.addEventListener('input', function () {
        var wrap = fieldOf(input);
        if (wrap && wrap.getAttribute('data-invalid') === 'true') validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: real people never fill this in
      var honey = form.elements.namedItem('company');
      if (honey && honey.value) return;

      var required = form.querySelectorAll('[required]');
      var firstBad = null;
      required.forEach(function (input) {
        if (!validate(input) && !firstBad) firstBad = input;
      });
      var email = form.querySelector('#email');
      if (email && email.value.trim() !== '' && !validate(email) && !firstBad) firstBad = email;

      if (firstBad) { firstBad.focus(); return; }

      // NB: use form.elements — `form.name` resolves to the form's own
      // `name` property, not the input named "name".
      var el = function (n) { return form.elements.namedItem(n); };
      var payload = {
        name: el('name').value.trim(),
        phone: el('phone').value.trim(),
        email: el('email').value.trim(),
        reason: el('reason').value,
        details: el('details').value.trim()
      };

      var done = function (title, body) {
        var t = document.getElementById('form-status-title');
        var b = document.getElementById('form-status-body');
        if (t) t.textContent = title;
        if (b) b.textContent = body;
        form.hidden = true;
        if (status) {
          status.setAttribute('data-show', 'true');
          status.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }
      };

      if (!FORM_ENDPOINT) {
        done(
          'Thanks — we’ve got your details.',
          'This form isn’t connected to a mailbox yet. To be seen today, please call us directly.'
        );
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        done(
          'Thanks — your request is on its way.',
          'We’ll be in touch during office hours. If you’re in pain right now, please call us.'
        );
      }).catch(function () {
        done(
          'We couldn’t send that request.',
          'Something went wrong on our end. Please call us and we’ll help you straight away.'
        );
      });
    });
  }
})();
