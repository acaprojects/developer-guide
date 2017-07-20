# Writing SSH Drivers

SSH modules interface with devices or servers that communicate using the SSH 1.99/2.0 protocol. SSH 1 is considered obsolete due to inherent security flaws and not supported.

SSH modules are similar to [Device Drivers](driver-development/device-drivers.md) with an additional `exec` function, where supported by the remote. Unfortunately most AV devices seem to only support interactive shell, which is akin to telnet.

## Authentication

Supports the following authentication methods:
* none
* public key
* password

These settings must be defined in the JSON settings (dependency or driver instance) and would typically look like:

```javascript
{
    "ssh": {
        "username":  "account_name",
        "$password": "password", // $ sign will encrypt the password and/or private key
        "$key_data": "-----BEGIN RSA PRIVATE KEY-----\nMIIEogIBAAKCAQEAqccvUza8FCinI4X8HSiXwIqQN6TGvcNBJnjPqGJxlstq1IfU\nkFa3S9eJl+CBkyjfvJ5ggdLN0S2EuGWwc/bdE3LKOWX8F15tFP0=\n-----END RSA PRIVATE KEY-----"
    }
}
```


## Sending an exec request

If supported requests can be sent using the `exec` function. There are two modes of operation, depending on how much response data is required and requests can be performed in parallel.

```ruby
# =================
# Request semantics
# =================
# Simple request. (these are equivalent)
exec('command –a')
exec('command', '-a')

# Simple request. Complex arguments
exec('setname -full Stephen von Takach') # This will fail
exec('setname', '-full', 'Stephen von Takach') # Will succeed, escaped properly


# ==============================
# Accessing responses (promises)
# ==============================

# .value pauses execution and waits for the response before continuing
exec('command', '-a').value  # => return all output as a string or raise error

# .then provides callbacks so execution is not paused
exec('command', '-a').then { |response|
    # Process response
}.catch { |error|
    # Handle error
}

# Commands are queued by default as many devices can only handle a single request at a time.
# However you can perform requests in parallel
tasks = []
tasks << exec('command1', '-a', wait: false)
tasks << exec('command2', '-a', wait: false)
tasks << exec('command3', '-a', wait: false)

# Wait until all commands have completed (optional)
response_array = thread.all(tasks).value

```

There is a more complicated request form that provides access to exit codes and individual data streams.

```ruby

status = exec('uname', '-a') do |channel, stream, data|
    logger.debug { data } if stream == :stdout
    logger.error { data } if stream == :stderr
end
status.value # => {exit_code: 137, exit_signal: 9}

```

## Exec request options

| Option | Default Value | Description |
| :--- | :--- | :--- |
| `wait` | true | do we want to wait for a response before we continue processing |
| `delay` | 0  | minimum delay time between sends (milliseconds) |
| `delay_on_receive` | 0 | time to delay the next transmit after receiving data (milliseconds) |
| `retries` | 2 | number of times we'll retry a command if it has timed out |
| `timeout` | 5000 | amount of time we'll wait for a response to a command before retrying (milliseconds) |
| `priority` | 50 | so we can perform commands in preference to others |



