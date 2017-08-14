# Real-time API

The real-time API is the primary method for interacting with devices managed by ACAEngine. Under the hood it uses *websockets* to allow you to build responsive interfaces, monitoring systems and other extensions which require live, two-way interaction.

?> If you are building experiences based on the [Angular](https://angular.io/) framework, we have a [client library](https://github.com/acaprojects/a2-composer) ready to go.

## Endpoint address

To establish a connection with the real-time API, open a websocket connection to:

> `/control/websocket?bearer_token=...`

As with the web API, access is dependent on successful authentication via OAuth 2. Once you have [authenticated](api/authentication.md), the bearer token provides access. Failure to supply a valid bearer token while establishing a connection will result in a `HTTP 401` response.

## Protocol Overview

Messages that form the real-time API fall into either [command messages](#commands) or [heatbeat](#heartbeat) events.

## Commands

Commands form the basis for interacting with the real-time API. All commands take the form of a JSON payload, and will return a JSON response.

Within each command, the following parameters are required.

Parameter

 [:id, :cmd, :sys, :mod, :name]

### `exec`

### `bind`

### `unbind`

### `debug`

### `ignore`

## Heartbeat
