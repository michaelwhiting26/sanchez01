# Put the site online (Vercel), doable from a phone

The Next app (`apps/web`) is not hosted anywhere yet. The address `192.168.1.115:3000` only works on the home Wi-Fi while the Mac is on. Vercel builds straight from GitHub, so it can be done from a phone browser in about five minutes, and after that **every push to `main` updates the site automatically**.

1. Go to **vercel.com/new**, sign in with GitHub, and import **michaelwhiting26/sanchez01**.
2. Set **Root Directory** to `apps/web`. Framework: Next.js (auto). Leave the build settings alone.
3. Under **Environment Variables** add (Production and Preview):
   - `ALLOW_DEMO` = `1` (private demo: allows test prices, the mock deposit button and the built-in order-link secret; remove it for the real launch)
   - `TEST_PRICES` = `1` (synthetic prices so the funnel can be tried; remove when real prices exist)
   - `DEPOSIT_PERCENT` = `30` (placeholder: the real percentage is a business decision)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = your Google OAuth client id (optional: turns on Sign in with Google; add the Vercel https address to its Authorised JavaScript origins)
   - `DATABASE_URL` = a Postgres connection string. **Needed for orders**: on Vercel each request can land on a different server, so without a real database an order started on one is not found by the next (the waitlist and browsing still work, but sign-ups are lost on restart). Easiest: in the Vercel project, Storage, add **Neon** (free); it fills `DATABASE_URL` in for you, and the tables create themselves on first use.
4. Click **Deploy**. You get an `https://….vercel.app` link that works on any phone anywhere.

Real Stripe later: add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, set the webhook endpoint to `/api/stripe/webhook` (event `payment_intent.succeeded`), and set a long random `ORDER_LINK_SECRET`.
