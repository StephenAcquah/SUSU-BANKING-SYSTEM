 # SUSU PINHIN

SUSU PINHIN is a browser-based susu contribution and payout manager for keeping customer records, cash movements, balances, and daily summaries in one place.

## Run it

Open `index.html` in a modern browser. No build step or server is required.

Data is saved to the browser's local storage. Use the download button regularly to export a JSON backup, and use the upload button to restore or move records.

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
