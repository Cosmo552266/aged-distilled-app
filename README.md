# Aged & Distilled · Somm & Bev — trial

Static web app (no build step). Guests open `/?v=<venue-slug>`; staff sign in from the staff screen to save changes to Supabase.

- `config.js`: Supabase URL and publishable key (safe in the browser; row-level security protects the data).
- `cloud.js`: sync with the `items` and `venue_state` tables.
- `vendor/supabase.js`: Supabase JS v2 browser build.

© Aged & Distilled. All rights reserved. Not licensed for copying or reuse.

## Design reviews

`node tools/compare.js <before-ref> <after-ref> <out-dir> [welcome,list,drink,choose]` writes before/after images (phone and iPad) for each screen. Install first: `npm i --no-save puppeteer-core` (needs Google Chrome). Guest feedback arrives in the Supabase `feedback` table; a weekly review reads it, proposes changes on a `feedback/<date>` branch, and emails the comparison images.
