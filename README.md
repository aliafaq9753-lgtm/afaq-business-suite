# AFAQ Business Suite

A React + Vite web application shell that provides one Supabase email/password sign-in and opens the three existing AFAQ systems in same-origin frames.

## Included existing modules

- Cargo: `public/modules/cargo.html` — existing Cargo application retained without rewriting its internal workflows.
- Salary: `public/modules/salary.html` — existing Salary application retained; the shell mirrors the Supabase session to the legacy key `afaq_supabase_session_v1` that this module reads.
- Vehicle: `public/modules/vehicle.html` — existing Vehicle Maintenance application retained without rewriting its internal workflows.

The three applications continue using their separate existing data stores. The shell does not merge, migrate, clear, or overwrite those stores.

## Data and authentication notes

- Shared Supabase project: `https://jkhjfzevhgxjgqegqyjg.supabase.co`.
- Browser publishable key only. Never add a service-role key or database password.
- Cargo reads/writes `afaq_user_data` and keeps its existing offline/pending-sync behavior.
- Salary reads/writes `afaq_salary_data` and keeps its custom session cache, signature RPCs, and local cache.
- Vehicle reads/writes `vehicle_maintenance_store` and keeps its existing local/cloud sync behavior.
- Cargo and Vehicle create their own Supabase client inside their retained HTML. Because they are served from this same origin and project, they can read the shared Supabase Auth browser session.
- The shell mirrors the current access token into Salary's legacy session key. Test token refresh, logout, and employee signature links before production use.
- No SQL migrations are included. No production table or RLS policy is changed by this project.

## Run locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env
# Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The production output is `dist/`.

## Deploy to Netlify

1. Push this project folder to a private Git repository you control.
2. In Netlify, import that repository as a new site.
3. Set build command to `npm run build` and publish directory to `dist` (also specified in `netlify.toml`).
4. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using the existing project URL and publishable key.
5. Deploy to a temporary Netlify URL first. Do not replace the old live app links yet.
6. Test with an existing user account and verify each module's cloud load/save, file uploads/downloads, reports, signatures, and logout on desktop and mobile.
7. Only after all tests pass should you consider linking a production domain or retiring old links.

## Important release status

This is an integration shell around the three existing HTML applications, not yet a fully rewritten single React application. The source has not been deployed to the user's Netlify account. Production build dependencies must be installed in the deployment environment. The old apps should remain active until the new site passes real-account testing.
