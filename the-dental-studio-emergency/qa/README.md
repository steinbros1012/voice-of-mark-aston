# QA scripts

Playwright checks used to verify the redesign. They expect the site to be
served at `http://localhost:4173`.

```bash
cd the-dental-studio-emergency && python3 -m http.server 4173 &
npm i playwright
node qa/breakpoints.js    # overflow, tap targets, sticky header, console errors
node qa/interactions.js   # menu, accordions, form, map facade, reduced motion, keyboard
```

`breakpoints.js` covers 1440 / 1280 / 1024 / 768 / 430 / 390 / 375.

Set `executablePath` to your local Chromium if it is not at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

Last run: 0/7 breakpoints with issues, 26/26 interaction checks passing.
