# Writing Device Drivers

Device drivers implement a protocol on a raw transport stream, TCP or UDP.
For examples see our [open repository of device modules](https://github.com/acaprojects/aca-device-modules)

Backoffice can be used to define settings.

![image](https://cloud.githubusercontent.com/assets/368013/15108556/e70b07e4-1619-11e6-8646-6a5af7d71caf.png)

* Use Transport Layer Security (TLS) for encrypted communications
* UDP for stateless communication (UDP connections are always considered connected)
  * Multicast IP's are automatically detected and subscribed to the multicast group
* Use Make Break if you want the module to disconnect when there is nothing to communicate
  * Some devices require you work this way, this helps automate the process

## Typical Layout

```ruby
class Manufacturer::Type::ModuleName
  # Called on module load before the connection has initiated
  def on_load; end

  # Called before the module is cleaned up (disconnected already)
  def on_unload; end

  # Called after dependency reload and settings updates
  def on_update; end

  # Called once the connection to the device is ready
  def connected; end

  # Called once the connection closes
  def disconnected; end

  # Called when the device transmits data
  def received(data, deferrable, command)
    # data == data from the device as a String
    # deferrable == allows you to decide if a result was a success asynchronously
    # command == last command sent that hasn’t been resolved (raw command + metadata)
  end
end
```

## Transmitting a request

Requests are added the transmit queue by calling `send(raw_cmd, options_hash)`.

The `raw_cmd` can be in a number of formats:
* String => will be transmitted as is
* Array of bytes => will be automatically converted to a string for sending
* Hex String => will be converted to a binary string if requested `send('0xbeef', hex_string: true)`

The options are as follows:

| Option | Default Value | Description |
| :--- | :--- | :--- |
| `wait` | true | do we want to wait for a response before we continue processing |
| `delay` | 0  | minimum delay time between sends (milliseconds) |
| `delay_on_receive` | 0 | time to delay the next transmit after receiving data (milliseconds) |
| `max_waits` | 3 | number of times we'll accept an ignore response before retrying the request |
| `retries` | 2 | number of times we'll retry a command if it has failed |
| `timeout` | 5000 | amount of time we'll wait for a response to a command before retrying (milliseconds) |
| `priority` | 50 | so we can perform commands in preference to others (see section on priorities) |
| `force_disconnect` | false | causes the transport to disconnect once a response has been received
| `clear_queue` | nil/false | removes any other queued commands once it starts transmitting |
| `name` | nil | command type (e.g. `:power`). Queued commands of the same time will be overridden. |
| `emit` | nil | callback to occur when that request completes. Will not be called if another request with the same name overrides this request. |
| `on_receive` | nil | alternative receive function or block. Called in stead of `received` function |


## Processing a response

It's expected that the `received` function or `on_receive` callback return a result for the current command. When data is received, this function is called to see if

* The command was a success
* This data has nothing to do with the command in question
  * Some devices push data
* Some kind of failure

The expected values that should be returned by this function:

| Value | Description |
| :--- | :--- |
| `true, :success` (or result if not on of the values below)  | We've finished processing this command, move on to the next |
| `false, :retry, :failed, :fail` | The command didn't have the desired result, maybe the device was busy. Please send this command again |
| `nil, :ignore` | This data was not in response to our action. Continue waiting. |
| `:abort` | The command failed and it should not be retried. Abort differs from success as it is logged. |
| `:async` | Waits for the command to resolved by the deferrable passed to the `received` function |


## Priorities

Priorities ensure requests are processed in a sane order. For example if you are polling a projector for status and it only accepts one command every 300 milliseconds you don't want to wait for the polling, which might be 4 or 5 requests, to complete before executing a more important request like selecting a new input.

Sometimes a query might be made for control flow purposes so it is often useful to differentiate between user initiated requests and polling.

```ruby

# A best practice query function
def power?(opts = {}, &block)
    opts[:emit] = block if block_given?
    opts[:name] = :power_query
    send('power_query', opts)
end

# Example polling function
def poll
    power? priority: 0 do
        if self[:power] == On
            input? priority: 0
            volume? priority: 0
        end
    end
end

```

Priorities are also increased on a contextual basis. This is how retries, for instance, make their way back to the front of the queue - which is what you would expect. There is a configuration option called `priority_bonus` which increases the priority of a command in the following circumstances:

* Any request made when processing a response to a request
  * If you request volume status whilst processing the switching of an input, the query will receive a bonus and jump towards the front of the queue
* When a command fails and is retried, it also receives a bonus.

NOTE:: given default values, if you send commands in the received function and then return failed so the command is retried, the commands sent will be executed before the retry. You can counter this effect by providing lower priorities in this context.


## Helper functions

| Name | Description |
| :--- | :--- |
| `disconnect` | disconnects the current connection. It does not wait to send any buffered data |
| `remote_address` | returns the IP address or hostname defined in the database |
| `remote_port` | returns the port number defined in the database |
| `defaults` (options hash) | allows you to set custom default options for commands |
| `config` (options hash) | allows you to set custom processing configurations |
| `set_connected_state` (true or false) | overrides the default connection indicator (useful for UDP devices) |


For the various defaults and configuration options see the [command processor](https://github.com/acaprojects/ruby-engine/blob/master/lib/orchestrator/device/processor.rb).

When you `include ::Orchestrator::Constants` some common configuration and default options are exposed in a more declarative manner.

```ruby
tokenize delimiter: "\xAA"  # See the page on Tokenisation
delay between_sends: 200, on_receive: 100
wait_response false
queue_priority default: 50, bonus: 20
clear_queue_on_disconnect!
flush_buffer_on_disconnect!
before_transmit :run_function

def run_function(data, command)
    # You can modify the data at the last min here (might be waiting in the queue for awhile)
    return data
end

# For make break connections, in milliseconds
inactivity_timeout 5000
```
