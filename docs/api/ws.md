# Real-time API

The real-time API is the primary method for interacting with devices managed by ACAEngine. Under the hood it uses *WebSockets* to allow you to build responsive interfaces, monitoring systems and other extensions which require live, two-way interaction or server push.

?> If you are building experiences based on the [Angular](https://angular.io/) framework, we have a [client library](https://github.com/acaprojects/ngx-composer) ready to go.

## Endpoint address

To establish a connection with the real-time API, open a WebSocket connection to:

> `/control/websocket?bearer_token=...`

As with the web API, access is dependent on successful authentication via OAuth2. Once you have [authenticated](api/authentication.md), the bearer token provides access and represents the user account. Failure to supply a valid bearer token while establishing a connection will result in a `HTTP 401` response.

## Protocol Overview

Messages that form the real-time API are either [commands](#commands), [heartbeat](#heartbeat) or [debugging](#debugging) events.

## Commands

Command messages are the basis for interacting with the real-time API. All commands take the form of a JSON payload, and will return a JSON response.

Attribute | Type   | Description
--------- | ------ | -----------
`id`      | number or string | A unique ID to associated with the command. This is returned as part of the response. Generally an incrementing counter, however any *string* or *numerical* value may be used.
`cmd`     | string | The command type. One of `bind`, `unbind`, `debug`, `ignore` or `exec`.
`sys`     | string | The system ID that the command targets.
`mod`     | string | The name of the module that the command targets.
`name`    | string |

!> Command processing is typically asynchronous.

It's worth noting that when binding to a value, the current values will be returned in the order that bindings were made. Important if you want to perform actions based on a combination of states.


### bind

The `bind` command is used to subscribe module state changes on the current connection. The current state will be returned immediately.

Bindings are ephemeral, being discarded when the connection is closed.


```json
{
    "id": "1",         // tracking id, to pair request and response
    "cmd": "bind",     // request type
    "sys": "sys-OEtOZqd_2J",
    "mod": "Display",  // module generic name
    "index": 1,        // module index in the system
    "name": "power"    // status variable you are interested in
}
```

A typical response to the above request

```json
{
    "id": 1,           // tracking id
    "type": "success", // request status (success or error)
    "meta":{           // meta data that might be useful
        "sys": "sys-YNQ8uNfJvF",
        "mod": "Display",
        "index": 1,
        "name": "power"
    }
}
```

Once an active binding is in place the server will push value changes.

```json
{
    "type": "notify",

    // The value that was changed. i.e. Display_1.power == true
    "value": true,

    // The binding that triggered the change
    "meta": {
        "sys": "sys-YNQ8uNfJvF",
        "mod": "Display",
        "index": 1,
        "name": "power"
    }
}
```


### `unbind`

The `unbind` command cancels any subscriptions to the specified state.

```json
{
    "id": 2,
    "cmd": "unbind",
    "sys": "sys-YNQ8uNfJvF",
    "mod": "Display",
    "index": 1,
    "name": "power"
}
```

This will always result in a successful response

```json
{
    "id": 2,
    "type": "success"
}
```


### `exec`

The execute command performs an action on a device in a system.
It is a remote procedure call.

```json
{
    "id": 82,           // tracking id
    "cmd": "exec",      // request type
    "sys": "sys-YNQ8ucvndO",
    "mod": "Display",   // module generic name
    "index": 2,         // module index in the system

    // the driver function to call
    "name": "switch_to",

    // The function arguments (optional)
    "args": ["hdmi"]
}
```

Arguments, when provided, must always be an array however you can pass hashes to represent named parameters.

```ruby
def funky(argument, with:, named:, params: nil)
end
```

Can be called using

```json
"args": [3.14, {"with": true, "named": "values"}]
```

The return value of the function is returned in the response, assuming it can be serialised into JSON.

!> If the return value of the function was a [promise](https://en.wikipedia.org/wiki/Futures_and_promises). The value of the promise resolution is returned.

```json
{
    "id": 82,
    "type": "success",
    "value": ["hdmi"]
}
```

If an error was raised (or promise rejected) then the error message is returned.

```json
{
    "id": 82,
    "type": "error",
    "code": 3,
    "msg": "ZeroDivisionError: divided by 0"
}
```


### `debug`

This lowers the drivers log level to debug and forwards messages to the connection.

```json
{
    "id": 321,
    "cmd": "debug",
    "sys": "sys-Z6XXA-Kc_v",
    "mod": "Bookings",
    "index": 1,
    "name": "debug"
}
```

Responds with the module ID that uniquely identifies the code being monitored

```json
{
    "id": 321,
    "type": "success",
    "mod_id": "mod-Z6XXB1doL4",
    "meta": {
        "sys": "sys-Z6XXA-Kc_v",
        "mod": "Bookings",
        "index": 1
    }
}
```

Log messages are then sent to the browser

```json
{
    "type": "debug",
    "mod": "mod-Z6XXB1doL4",
    "klass": "::Some::Display",
    "level": "debug",
    "msg": "input changed to HDMI"
}
```


### `ignore`

The `ignore` command cancels any debug subscriptions and the log level is restored (if no other connections are debugging).

```json
{
    "id": 322,
    "cmd": "ignore",
    "sys": "sys-Z6XXA-Kc_v",
    "mod": "mod-Z6XXB1doL4",
    "index": null,
    "name": "ignore"
}
```

responds

```json
{
    "id": 322,
    "type": "success"
}
```


### Error Codes

Name | Code | Description
---- | ---- | -----------
parse error | 0 | invalid JSON sent to the server
bad request | 1 | request was missing required fields
access denied | 2 | you don't have permission to access this system, the access attempt is logged
request failed | 3 | an error was raised or a promise rejected when processing the request
unknown command | 4 | the command type unknown, the connection is logged as suspicious
system not found | 5 | the system does not exist
module not found | 6 | the module does not exist in the system
unexpected failure | 7 | a framework level error occurred (this should never happen)


Detailed error backtraces can be seen when remote debugging using the [debug](#debug) command or by inspecting server logs.


## Heartbeat

The client can periodically send a raw string as an application layer keep-alive.

`ping`

the server will respond

`pong`

