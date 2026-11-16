# Aged & Distilled · Somm & Bev — trial

Static web app (no build step). Guests open `/?v=<venue-slug>`; staff sign in from the staff screen to save changes to Supabase.

- `config.js`: Supabase URL and publishable key (safe in the browser; row-level security protects the data).
- `cloud.js`: sync with the `items` and `venue_state` tables.
- `vendor/supabase.js`: Supabase JS v2 browser build.

© Aged & Distilled. All rights reserved. Not licensed for copying or reuse.
