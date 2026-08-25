# Brand layer — what to swap in

The redesign was built without network access to the original page
(`smile.learnmore.live` is blocked by this environment's egress policy, as are
`thedentalstudionc.com`, `longdentalofwilmington.com`, and archive.org). Nothing
here was copied from the live site, and nothing was invented and passed off as
real. Everything brand-specific is isolated into the three places below, so
restoring the practice's actual identity does not touch layout or components.

## 1. Colour palette — `assets/css/styles.css`, `:root` block

Nine tokens drive every colour on the page. No rule anywhere else references a
raw hex value, so replacing these swaps the whole palette.

| Token | Current placeholder | What it controls |
|---|---|---|
| `--c-ink` | `#0E2A33` | Headings, dark sections, footer |
| `--c-ink-soft` | `#173A45` | Reserved for secondary dark surfaces |
| `--c-primary` | `#0A5C63` | Primary buttons, links, icon accents |
| `--c-primary-deep` | `#07464C` | Primary button hover |
| `--c-primary-tint` | `#E6F0F0` | Icon backgrounds, form success panel |
| `--c-accent` | `#C2643C` | Urgency accents, stars, map pin — used sparingly |
| `--c-accent-tint` | `#FBEFE8` | Safety notice background |
| `--c-cream` | `#FAF7F2` | Page background |
| `--c-surface-alt` | `#F3EEE6` | Alternating section background |

The placeholders are a warm neutral + deep teal, chosen to read as *premium
boutique dental* rather than clinical. **Replace them with the practice's real
values.** After swapping, re-check contrast: body copy targets ≥ 7:1 and
supporting text ≥ 4.5:1 against its background.

## 2. Photography — `assets/img/*.svg`

Every image is currently a labelled placeholder slot, **not** a stock photo.
Each one names the file it expects and holds the exact aspect ratio the layout
reserves, so dropping in the real photo causes no layout shift.

| Slot | Aspect | Where it appears |
|---|---|---|
| `hero.svg` | 4:5 (16:11 on mobile) | Hero |
| `dr-long.svg` | 4:5 | "Why The Dental Studio" |
| `video-consult.svg` | 4:3 | Video consultation split |
| `broken-tooth.svg` … `wisdom-teeth.svg` (10) | 3:2 | Emergency grid |

To swap: save the original photo over the slot (as `.jpg`/`.webp`) and update
the `src` and the `width`/`height` attributes in `index.html`. The containers
already use `object-fit: cover`, so any reasonable crop will sit correctly.

## 3. Logo — the wordmark in `index.html`

The header and footer use a typographic wordmark (`.wordmark`) rather than an
invented logo mark. Replace the `<span class="wordmark">…</span>` in both
places with:

```html
<img src="assets/img/logo.svg" alt="The Dental Studio" width="200" height="42">
```

## Typography

Fraunces (display) + Inter (body), two weights each, loaded from Google Fonts.
If the practice has established brand faces, change `--font-display` and
`--font-body` and update the `<link>` in `index.html`.
