export function SetupNotice() {
  return (
    <main className="screen center">
      <h1 className="title">Setup needed</h1>
      <p className="muted">
        Copy <code>apps/web/.env.example</code> to <code>apps/web/.env.local</code> and fill in
        VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.
      </p>
    </main>
  );
}
