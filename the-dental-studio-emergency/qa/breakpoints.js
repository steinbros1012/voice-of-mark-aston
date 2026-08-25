const { chromium } = require('playwright');

const SIZES = [
  ['desktop-1440', 1440, 900], ['desktop-1280', 1280, 800], ['desktop-1024', 1024, 768],
  ['tablet-768', 768, 1024],
  ['mobile-430', 430, 932], ['mobile-390', 390, 844], ['mobile-375', 375, 812],
];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  let bad = 0;

  for (const [name, w, h] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [], failed = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('requestfailed', r => failed.push(r.url()));

    await page.goto('http://localhost:4173/', { waitUntil: 'load' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in')));
    await page.waitForTimeout(300);

    const m = await page.evaluate(() => {
      const de = document.documentElement, over = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        // .hp is the off-screen honeypot; .quotes is an intentional
        // horizontal scroll container that bleeds to the screen edges.
        if (el.closest('.hp') || el.closest('.quotes')) return;
        if (r.right > de.clientWidth + 1.5 || r.left < -1.5) {
          const cn = (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().split(' ')[0];
          over.push(`${el.tagName}.${cn}[${Math.round(r.left)}→${Math.round(r.right)}]`);
        }
      });
      const small = [];
      document.querySelectorAll('a.btn, button, .nav__list a, .acc__btn, .header__call-icon, .mobile-nav__list a').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (r.height < 44) small.push(`${el.tagName} h=${Math.round(r.height)} "${(el.textContent||'').trim().slice(0,22)}"`);
      });
      return { scrollW: de.scrollWidth, clientW: de.clientWidth,
               over: [...new Set(over)].slice(0,6), small: [...new Set(small)].slice(0,6),
               callbar: getComputedStyle(document.getElementById('callbar')).display,
               nav: getComputedStyle(document.querySelector('.nav')).display };
    });

    // sticky header must survive the overflow-x containment
    await page.evaluate(() => window.scrollTo(0, 2500));
    await page.waitForTimeout(200);
    const stickyTop = await page.evaluate(() => Math.round(document.querySelector('.header').getBoundingClientRect().top));
    await page.evaluate(() => window.scrollTo(0, 0));

    // font blocking is this sandbox's egress policy, not a page defect
    const realErrors = errors.filter(e => !/ERR_CONNECTION_RESET|ERR_BLOCKED|fonts\.g/i.test(e));
    const realFailed = failed.filter(u => !/fonts\.(googleapis|gstatic)/.test(u));

    const hScroll = m.scrollW > m.clientW + 1;
    const issues = hScroll || m.over.length || realErrors.length || m.small.length || stickyTop !== 0;
    if (issues) bad++;

    console.log(`\n── ${name} (${w}×${h})`);
    console.log(`   h-scroll ......... ${hScroll ? `✗ ${m.scrollW}>${m.clientW}` : 'no ✓'}`);
    console.log(`   overflow ......... ${m.over.length ? '✗ ' + m.over.join(' ') : 'none ✓'}`);
    console.log(`   tap <44px ........ ${m.small.length ? '✗ ' + m.small.join(' | ') : 'none ✓'}`);
    console.log(`   sticky header .... ${stickyTop === 0 ? 'pinned ✓' : '✗ top=' + stickyTop}`);
    console.log(`   console errors ... ${realErrors.length ? '✗ ' + realErrors.join(' | ') : 'none ✓'}`);
    console.log(`   failed requests .. ${realFailed.length ? '✗ ' + realFailed.join(' | ') : 'none ✓'}`);
    console.log(`   callbar=${m.callbar} nav=${m.nav}`);

    await page.screenshot({ path: `shot-${name}.png` });
    await ctx.close();
  }
  await browser.close();
  console.log(`\n=== breakpoints with issues: ${bad}/${SIZES.length} ===`);
})();
