# @ghost_agent/ui

Angular UI package for GhostAgent chat integration.

## What it exports

Public entrypoint: `src/lib/index.ts`

- `GfGhostAgentChatComponent`
- `GHOSTAGENT_API_CLIENT` injection token
- `GhostAgentApiClient` TypeScript interface

## Host contract

The host app provides an implementation for `GhostAgentApiClient`, including:

- `postAiChat`
- `getAiChatSession`
- `postAiFeedback`
- `getAiSessionFeedback`
- `getAiModelPreference`
- `updateAiModelPreference`

## Component behavior

`GfGhostAgentChatComponent` currently includes:

- chat send flow and assistant message rendering
- model preference loading/updating
- session restore and local storage persistence for `sessionId`
- per-response feedback submission and hydration from prior feedback

## Build output

This package is built with `ng-packagr` and emits APF artifacts to `dist/`.

## Security

- This package should not hold secrets.
- API keys and sensitive operations must remain server-side in the host backend.
