# Flow: Staff Portal Chat

## Purpose

Two-way WebSocket chat.

## Steps

```mermaid
sequenceDiagram
  participant Portal
  participant WS as WebSocket
  participant API
  participant Staff

  Portal->>API: PROC-comms.createThread
  Portal->>WS: join thread room
  Portal->>WS: message.send
  WS->>API: Persist Message
  WS->>Staff: message.received
  Staff->>WS: message.send
  WS->>Portal: message.received
  Staff->>API: Mark read via REST fallback
```

## Protocol

[09-api-and-events/05-websocket-chat-protocol.md](../09-api-and-events/05-websocket-chat-protocol.md)

## Screens

`SCR-portal-messages`, `SCR-admin-inbox`

## AC

EPIC-041
