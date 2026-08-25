# The Dental Studio — Emergency Dental Care (Wilmington, NC)

A conversion-focused redesign of the emergency dental landing page. Static
HTML, CSS, and vanilla JavaScript — no framework, no build step, no runtime
dependencies.

```
the-dental-studio-emergency/
├── index.html              # the whole page
├── assets/css/styles.css   # design system + all styles
├── assets/js/main.js       # nav, accordions, reveal, map facade, form
├── assets/img/             # labelled placeholder image slots
└── assets/brand/BRAND.md   # how to swap in the real palette, photos, logo
```

## Run locally

```bash
cd the-dental-studio-emergency
python3 -m http.server 4173
# → http://localhost:4173
```

## Before this goes live

Three things need the practice's own content. They are isolated and clearly
marked — see `assets/brand/BRAND.md` for the first two.

1. **Palette, photography, and logo** — currently placeholders.
2. **Patient testimonials** — the three cards in the `#reviews` section carry
   placeholder text on purpose. No testimonial was fabricated. Paste the real
   quotes and the patient names exactly as published.
3. **Form endpoint** — set `FORM_ENDPOINT` at the top of the form block in
   `assets/js/main.js` to the practice's form handler (Formspree, a CRM
   endpoint, a serverless function — anything accepting a JSON `POST` of
   `{name, phone, email, reason, details}`). Until it is set, the form
   validates and then directs the visitor to the phone number, which is the
   faster route in an emergency regardless.

## Facts used on the page

Business name, doctor name, address, and phone are exactly as supplied and were
not altered. "Senca Drive" is the correct spelling — it was checked rather than
"corrected" to Seneca.

- The Dental Studio · 9020 Senca Drive, Wilmington, NC 28411 · 910-756-5100
- Office hours (Mon–Thu 8–5, Fri 8–2, weekends closed) came from third-party
  listings, not the original page. **Confirm before launch** — they also appear
  in the `openingHoursSpecification` of the JSON-LD.

## Medical content

Guidance in the "What to do now" accordions is deliberately conservative: first
aid and "call us", never diagnosis or treatment instruction. Red-flag symptoms
— trouble breathing or swallowing, spreading facial swelling, uncontrolled
bleeding, serious head or facial trauma — are routed to 911 or the emergency
room, both in a notice directly under the hero and inline on the four cards
where those symptoms plausibly arise.

## Deploying

Vercel serves this as static output with no build step (`vercel.json` sets
security headers and long-lived caching for `assets/`). Any static host works —
there is nothing to compile.
