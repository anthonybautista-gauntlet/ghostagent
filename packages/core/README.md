# @ghost_agent/core

Core backend package for GhostAgent extraction.

## What it exports

Public entrypoint: `src/lib/index.ts`

- Fact registry utilities (`buildAiFactRegistry`)
- Feedback/session policy helpers
- Tool routing helpers (`routeMessageToTools`, `selectToolsForMessage`)
- Model catalog helpers (`DEFAULT_GHOSTAGENT_MODELS`, catalog/model resolvers)
- Verification service (`GhostAgentVerificationService`)
- Runtime contracts for session store, tools, model config, and verification

## Runtime assets included in package

- CLI binary: `bin/ghostagent-init.mjs` (exposed as `ghostagent`)
- Prisma snippets and migrations under `prisma/`
- Host scaffold templates under `scaffolds/`

## `ghostagent` init CLI

The binary runs in dry-run mode by default and prints intended changes.

```bash
ghostagent
```

Apply mode writes changes to the host project:

```bash
ghostagent --apply
```

The CLI expects to run from the host repo root and checks/patches:

- `.env.example`
- `prisma/schema.prisma`
- `prisma/migrations/*` for GhostAgent migration snippets
- optional host app files (AI endpoint scaffold files, app routes/module wiring, UI data service helper methods)

## Peer dependency

- `@nestjs/common` `^11`

## Security

- Keep inference credentials and auth context on the server side.
- Do not expose provider API keys or user-scoped data handling in client code.
