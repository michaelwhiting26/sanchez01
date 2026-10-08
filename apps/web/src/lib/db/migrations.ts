/** Database migrations, applied in order at first connection (recorded in schema_migrations). Plain Postgres SQL; the same runs on PGlite locally and on a hosted Postgres. */
export const MIGRATIONS: ReadonlyArray<{ id: string; sql: string }> = [
  {
    id: "001_init",
    sql: `
      CREATE TABLE IF NOT EXISTS waitlist_entries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL,
        method text NOT NULL DEFAULT 'email',
        source text NOT NULL DEFAULT 'form',
        name text,
        google_sub text,
        product text NOT NULL DEFAULT 'bag',
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS waitlist_entries_email_key ON waitlist_entries (lower(email));

      CREATE TABLE IF NOT EXISTS orders (
        id uuid PRIMARY KEY,
        status text NOT NULL,
        schema_version text NOT NULL,
        config jsonb NOT NULL,
        currency text NOT NULL,
        book text NOT NULL,
        total_minor integer NOT NULL CHECK (total_minor >= 0),
        deposit_minor integer NOT NULL CHECK (deposit_minor >= 0),
        payment_intent_id text,
        history jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

      CREATE TABLE IF NOT EXISTS payment_events (
        id text PRIMARY KEY,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
  {
    // The 3D store (docs/STORE-3D.md): versions, products and their files, anonymous sessions and the funnel events.
    id: "002_storefront",
    sql: `
      CREATE TABLE IF NOT EXISTS storefront_versions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        version text NOT NULL,
        active boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        slug text UNIQUE NOT NULL,
        name text NOT NULL,
        description text,
        base_price integer,
        active boolean DEFAULT true,
        sort_order integer NOT NULL
      );
      CREATE TABLE IF NOT EXISTS product_assets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid REFERENCES products(id),
        asset_type text,
        url text,
        version text
      );
      CREATE TABLE IF NOT EXISTS store_sessions (
        id uuid PRIMARY KEY,
        anonymous_id text,
        created_at timestamptz DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS experience_events (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        session_id uuid,
        event_name text,
        properties jsonb,
        occurred_at timestamptz DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS experience_events_name_time_idx ON experience_events (event_name, occurred_at)
    `,
  },
  {
    // Quote requests from the form on /contact (lib/quote.ts). contact is an email address or an Instagram handle, as the visitor typed it.
    id: "003_quote_requests",
    sql: `
      CREATE TABLE IF NOT EXISTS quote_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        contact text NOT NULL,
        product text NOT NULL,
        details text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS quote_requests_created_idx ON quote_requests (created_at)
    `,
  },
];
