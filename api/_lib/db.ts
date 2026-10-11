import postgres from 'postgres';

let client: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

export function getSql(): ReturnType<typeof postgres> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }
  client ??= postgres(connectionString, {
    max: 1,
    ssl: connectionString.includes('sslmode=disable') ? false : 'require',
  });
  return client;
}

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  const sql = getSql();
  schemaReady = (async () => {
    await sql`
      create table if not exists users (
        id text primary key,
        oauth_provider text not null,
        oauth_id text not null,
        display_name text not null,
        avatar_url text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        unique (oauth_provider, oauth_id)
      )
    `;
    await sql`
      create table if not exists game_saves (
        user_id text primary key references users(id) on delete cascade,
        save_data jsonb not null,
        updated_at timestamptz not null default now()
      )
    `;
    await sql`
      create table if not exists pvp_battles (
        code text primary key,
        host_user_id text not null references users(id) on delete cascade,
        guest_user_id text references users(id) on delete set null,
        room_data jsonb not null,
        status text not null default 'waiting',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
    await sql`
      create index if not exists pvp_battles_host_idx on pvp_battles (host_user_id)
    `;
    await sql`
      create index if not exists pvp_battles_guest_idx on pvp_battles (guest_user_id)
    `;
  })();
  return schemaReady;
}
