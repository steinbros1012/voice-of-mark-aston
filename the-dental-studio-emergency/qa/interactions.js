const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ok = (l, c) => console.log(`   ${c ? '✓' : '✗'} ${l}`);

  // ---------- mobile ----------
  let ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  let page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:4173/', { waitUntil: 'load' });

  console.log('\n▸ Mobile menu');
  await page.click('[data-menu-open]');
  await page.waitForTimeout(300);
  ok('drawer opens', await page.getAttribute('#mobile-nav', 'data-open') === 'true');
  ok('aria-expanded set', await page.getAttribute('[data-menu-open]', 'aria-expanded') === 'true');
  ok('body scroll locked', await page.evaluate(() => document.body.classList.contains('is-locked')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  ok('Escape closes', await page.getAttribute('#mobile-nav', 'data-open') === 'false');
  await page.click('[data-menu-open]'); await page.waitForTimeout(250);
  await page.click('.mobile-nav__list a[href="#emergencies"]'); await page.waitForTimeout(400);
  ok('nav link closes drawer + jumps', await page.getAttribute('#mobile-nav', 'data-open') === 'false');

  console.log('\n▸ Accordion');
  const accBtn = page.locator('.acc__btn').first();
  ok('starts collapsed', await accBtn.getAttribute('aria-expanded') === 'false');
  await accBtn.click(); await page.waitForTimeout(350);
  ok('expands (aria)', await accBtn.getAttribute('aria-expanded') === 'true');
  const panelH = await page.locator('.acc__panel').first().evaluate(el => el.getBoundingClientRect().height);
  ok(`panel has height (${Math.round(panelH)}px)`, panelH > 20);
  await accBtn.click(); await page.waitForTimeout(350);
  ok('collapses again', await accBtn.getAttribute('aria-expanded') === 'false');

  console.log('\n▸ Sticky call bar');
  ok('visible on mobile', await page.locator('#callbar').isVisible());
  ok('dials correct number', await page.locator('#callbar a').getAttribute('href') === 'tel:+19107565100');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(400);
  const overlap = await page.evaluate(() => {
    const bar = document.getElementById('callbar').getBoundingClientRect();
    const foot = document.querySelector('.footer__small').getBoundingClientRect();
    return { clear: foot.bottom <= bar.top + 1, gap: Math.round(bar.top - foot.bottom) };
  });
  ok(`does not cover footer text (gap ${overlap.gap}px)`, overlap.clear);

  console.log('\n▸ Form validation');
  await page.evaluate(() => document.getElementById('request').scrollIntoView());
  await page.click('#appointment-form button[type="submit"]');
  await page.waitForTimeout(250);
  ok('blocks empty submit', await page.locator('#appointment-form').isVisible());
  ok('marks name invalid', await page.locator('#name').evaluate(el => el.closest('.field').getAttribute('data-invalid')) === 'true');
  ok('focus moved to first bad field', await page.evaluate(() => document.activeElement.id) === 'name');
  await page.fill('#name', 'Jordan Reed');
  await page.fill('#phone', '910-555-0134');
  await page.fill('#email', 'not-an-email');
  await page.selectOption('#reason', { label: 'Severe tooth pain' });
  await page.click('#appointment-form button[type="submit"]');
  await page.waitForTimeout(250);
  ok('catches malformed email', await page.locator('#email').evaluate(el => el.closest('.field').getAttribute('data-invalid')) === 'true');
  await page.fill('#email', 'jordan@example.com');
  await page.click('#appointment-form button[type="submit"]');
  await page.waitForTimeout(400);
  ok('valid submit shows status', await page.locator('#form-status').getAttribute('data-show') === 'true');
  ok('status offers phone fallback', await page.locator('#form-status a').getAttribute('href') === 'tel:+19107565100');

  console.log('\n▸ Map facade');
  ok('no iframe before click', await page.locator('.map iframe').count() === 0);
  await page.locator('[data-map-load]').scrollIntoViewIfNeeded();
  await page.click('[data-map-load]');
  await page.waitForTimeout(300);
  ok('iframe injected on click', await page.locator('.map iframe').count() === 1);
  ok('iframe has a title', !!(await page.locator('.map iframe').getAttribute('title')));

  ok('no uncaught JS errors', errs.length === 0);
  if (errs.length) console.log('     ', errs);
  await ctx.close();

  // ---------- reduced motion ----------
  console.log('\n▸ prefers-reduced-motion');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  page = await ctx.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const revealed = await page.evaluate(() =>
    [...document.querySelectorAll('.reveal')].every(e => getComputedStyle(e).opacity === '1'));
  ok('all content visible without animation', revealed);
  ok('smooth scroll disabled', await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto');
  await ctx.close();

  // ---------- keyboard ----------
  console.log('\n▸ Keyboard');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement.className);
  ok('skip link is first stop', first.includes('skip-link'));
  const ring = await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow);
  ok('focus ring visible', ring && ring !== 'none');
  await ctx.close();

  await browser.close();
})();
