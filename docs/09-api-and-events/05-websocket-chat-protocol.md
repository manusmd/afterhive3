# WebSocket Chat Protocol

## Purpose

Real-time staff ↔ portal messaging on **`apps/admin`** and **`apps/portal`** only.

## Scope

MVP full two-way chat

## Connection

- URL: `wss://{host}/ws/chat?token={sessionToken}` (admin or portal app origin; nginx proxies WebSocket upgrade)
- Auth: validate Better Auth session; tenant from token claims
- Heartbeat: ping/pong 30s

## Client → Server messages

```typescript
type ClientMessage =
  | { type: 'join'; threadId: string }
  | { type: 'leave'; threadId: string }
  | { type: 'send'; threadId: string; body: string; clientId: string }
  | { type: 'read'; threadId: string; messageId: string }
  | { type: 'typing'; threadId: string; isTyping: boolean };
```

## Server → Client messages

```typescript
type ServerMessage =
  | { type: 'message'; message: MessageDTO }
  | { type: 'read'; threadId: string; userId: string; messageId: string }
  | { type: 'typing'; threadId: string; userId: string; isTyping: boolean }
  | { type: 'error'; code: string; message: string };
```

## Persistence

`send` → PROC-comms.sendMessage → DB → broadcast to thread room

## Rooms

Redis adapter for multi-instance future; MVP single web instance room map in memory + Redis pub/sub optional

## Fallback

Polling `PROC-comms.listThreads` every 30s if WebSocket fails; banner in UI

## Permissions

Policy check on join and send per thread participants
