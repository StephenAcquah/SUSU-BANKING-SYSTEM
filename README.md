 # F EMMANUEL 85 VENTURES

F EMMANUEL 85 VENTURES is a susu contribution and payout manager for keeping customer records, cash movements, balances, and daily summaries in one place.

## Run it

Open `index.html` in a modern browser. No build step or server is required.

Data is saved to the browser's local storage. Use the download button regularly to export a JSON backup, and use the upload button to restore or move records.

## Cloud database setup

The cloud database schema is in `supabase/schema.sql`.

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste in `supabase/schema.sql`, and run it.
3. Open **Project Settings > API** and copy the Project URL and anon key.
4. Put those values in `js/supabase-config.js`.
5. Commit and push that file to GitHub so Vercel can redeploy.

The anon key may be used by the frontend only because Row Level Security is enabled. Never put a Supabase service-role key in `js/` or any browser-visible file.

The repository now includes a server-side API in `server.js` and Vercel routing in `vercel.json`. Before deploying, install dependencies with `npm install`. In Vercel Project Settings > Environment Variables, add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGIN`. Never commit the service-role key or put it in `js/`.

## Testing

Open `test-lab.html` for an isolated QA sandbox. It tests input escaping and documents the expected manager/staff access rules without authenticating or changing production data. Use fake values only, and delete this file before the public production launch.

The existing browser interface still uses its local data adapter. The API foundation is ready, but the remaining integration is to replace the local adapter calls in `js/data.js`, `js/auth.js`, `js/customers.js`, and `js/transactions.js` with authenticated API calls. Do not enter real records until that frontend switch is complete.

The login and role controls protect this browser workspace, but they are not a replacement for server-side security. Anyone with access to the computer and browser storage can potentially inspect or change local data. For production use, move authentication, authorization, and banking records to a secure backend with HTTPS, server-side password hashing, database backups, and an audit log.

## Current capabilities

- Customer CRUD with next-of-kin and phone details
- Cash In and Cash Out records with payment book numbers
- Per-customer balance calculations and insufficient-balance protection
- Daily and monthly reports
- Search, date filters, responsive navigation, and JSON import/export

## Recommended next features

1. **User accounts and permissions:** separate admins, tellers, and auditors with sign-in and an activity trail.
2. **Cloud sync:** move data from local storage to a hosted database with automatic backups and multi-device access.
3. **Receipt printing:** generate branded receipts with a transaction number, customer signature, and printable layout.
4. **Contribution schedules:** define weekly or monthly targets, due dates, missed-payment alerts, and member standing.
5. **SMS or WhatsApp notifications:** send payment confirmations, balance updates, and payout reminders.
6. **Reconciliation:** compare physical cash with recorded cash and record opening and closing cash counts.
7. **Audit controls:** prevent deletion after approval, add reversal transactions, and keep immutable change history.
8. **Analytics:** add collection trends, payout forecasts, top active members, and exportable spreadsheet reports.
