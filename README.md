# My Training Tracker V6

V6 adds the first real phone-notification backend. The app remains a simple Vercel-hosted PWA, while Supabase stores push subscriptions and runs the reminder scheduler.

## Architecture

- **Vercel**: serves the app and runs small server-side push endpoints.
- **Supabase Postgres**: stores notification subscriptions and delivery records.
- **Supabase Cron**: invokes the Vercel reminder endpoint every minute.
- **Web Push**: delivers notifications even when the app is not open.

The reminder times are interpreted in `Europe/London`, so the schedule follows GMT/BST automatically.

## Setup

1. Create a Supabase project. The Free plan provides ample database/function quota for this personal use case.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Enable the `pg_cron`, `pg_net`, and Vault extensions if the SQL editor asks you to.
4. Install dependencies locally if you want to generate VAPID keys:

   `npm install`

5. Generate a VAPID key pair once:

   `node -e "const webpush=require('web-push'); console.log(webpush.generateVAPIDKeys())"`

   Keep the private key secret. Put the public and private values into Vercel environment variables.

6. Add these Vercel environment variables for the Production environment:

   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` — e.g. `mailto:your-email@example.com`
   - `REMINDER_CRON_SECRET` — a long random string

7. Deploy the project to Vercel.

8. In Supabase, create the Vault secrets and the one-minute cron job using the commented SQL at the bottom of `supabase/schema.sql`. Replace the Vercel production URL and cron secret.

9. On the phone, open the deployed app in Safari, choose **Add to Home Screen**, open the installed app, go to **Reminders**, and tap **Enable phone notifications**. On iPhone/iPad, Web Push permission is supported for Home Screen web apps and must be requested after a user interaction.

10. Tap **Send test**. If that arrives, the scheduled reminders are ready.

## Reminder behaviour

- Supplements: default 08:00
- BP morning: default 08:00
- BP evening: default 20:00
- Food: optional, default 20:00

The app sends at most one copy of each reminder per device per UK calendar day. Delivery records make the scheduler idempotent if a scheduled job is invoked more than once.

## Important security note

The Supabase service-role key and VAPID private key are server-side secrets only. They must never be placed in `index.html`, the manifest, or client-side JavaScript.
