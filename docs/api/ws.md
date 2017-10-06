# Real-time API

The real-time API is the primary method for interacting with devices managed by ACAEngine. Under the hood it uses *WebSockets* to allow you to build responsive interfaces, monitoring systems and other extensions which require live, two-way interaction.

?> If you are building experiences based on the [Angular](https://angular.io/) framework, we have a [client library](https://github.com/acaprojects/a2-composer) ready to go.

## Endpoint address

To establish a connection with the real-time API, open a WebSocket connection to:

> `/control/websocket?bearer_token=...`

As with the web API, access is dependent on successful authentication via OAuth 2. Once you have [authenticated](api/authentication.md), the bearer token provides access. Failure to supply a valid bearer token while establishing a connection will result in a `HTTP 401` response.

## Protocol Overview

Messages that form the real-time API are either [commands](#commands) or [heartbeat](#heartbeat) events.

## Commands

Command messages are the basis for interacting with the real-time API. All commands take the form of a JSON payload, and will return a JSON response.

Attribute | Type   | Description
--------- | ------ | -----------
`id`      | number or string | A unique ID to associated with the command. This is returned as part of the response. Generally an incrementing counter, however any *string* or *numerical* value may be used.
`cmd`     | string | The command type. One of `bind`, `unbind` or `exec`.
`sys`     | string | The system ID that the command targets.
`mod`     | string | The name of the module that the command targets.
`name`    | string |

!> Command processing is asynchronous.

multiplexed
ordering not guaranteed

### bind

The `bind` command is used to subscribe module state updates on the current connection. Bind requests

local to connection, ephemeral

#### Example

```json
{
    "id": "1",
    "cmd": "bind",
    "sys": "sys-OEtOZqd_2J",
    "mod": "System",
    "name": "state"
}
```

### `unbind`

### `exec`

### `debug`

### `ignore`

## Heartbeat

Application layer keep-alive
