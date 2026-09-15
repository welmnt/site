# Security notes

## Database

The posture and the rules behind it are in [`supabase/README.md`](supabase/README.md).
Executable assertions: `bash supabase/tests/run.sh` — 16 checks, all passing.

The **anon key ships in the browser by design**. It is a publishable key; every table is
default-deny behind it, the only anon write is an insert-only form table that cannot be
read back, and anything touching money or PII goes through a permission-checked RPC.
The **service_role key must never** appear in this repo, in a bundle, or in a workflow
file — only in Supabase's own server-side environment.

## Open Dependabot alerts, and why they stand

| Alert | Scope | Assessment |
|---|---|---|
| `vite` path traversal in optimized-deps `.map` (**high**) | development | Dev server only. Never runs in production; the build output is static files. Fix requires vite 8 (breaking). |
| `vite` `server.fs.deny` bypass on Windows | development | Dev server, Windows only. Development here is macOS. |
| `esbuild` dev-server request forgery | development | Dev server only. |
| `react-router` open redirect via backslash | **runtime** | Not reachable — see below. Fix requires react-router v7 (breaking major). |
| `react-router` constructor injection via `deserializeErrors` | **runtime** | Requires a data router with server-serialized errors. This app uses plain `<BrowserRouter>` and no loaders/actions, so the code path does not exist. |

### Why the open redirect is not reachable

It needs an attacker-controlled navigation target. Every target in this app is either a
string literal or interpolates `programs.slug`:

```
/programmes/${slug}
/enrol?programme=${slug}
```

`programs` is SELECT-only for `anon`. A slug can only be written by staff who hold
`programs:write` — someone who already has far more power than an open redirect confers.

Rather than rely on that argument holding as the app grows, migration
`20260915150000_slug_shape.sql` constrains the column:

```sql
check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 60)
```

A backslash cannot enter the slug at all now, so the class is closed by construction —
including for whoever later adds a slug field to a public form without remembering why
it mattered.

### When to revisit

Take react-router v7 and vite 8 together as one deliberate upgrade, not as a rushed
response to an alert that is currently unreachable. Re-check before that upgrade that the
navigation-target audit above still holds.
