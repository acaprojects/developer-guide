# Driver State

A driver should be built to represent the state of the device it is abstracting.

* User interfaces can bind to state to provide visual feedback
* Logic can query state and subscribe to state changes to trigger further actions

!> Driver state is should always be considered public

* Any authenticated user can read the state
* Do not store sensitive material in state


## Exposing State

A driver [quacks](https://en.wikipedia.org/wiki/Duck_typing) like a hash

> All state keys must be [Symbols](https://ruby-doc.org/core-2.4.2/Symbol.html), [Strings](https://ruby-doc.org/core-2.4.2/String.html) or respond to `.to_sym`

* Setting state `self[:state_key] = 'value'`
* Reading state `self[:stafe_key] # => 'value'`

Logic can access driver state in the same way

* Reading state `system[:Display][:power] # => true`
* Setting state `system[:Display][:not_recommended] = true`

Logic might trigger a useful action by changing the state of other drivers directly, however generally it is recommended to use a [mutator method](https://en.wikipedia.org/wiki/Mutator_method)

> All state values should be limited to objects that can be converted to JSON for transmitting over the API

* JSON compatible classes: `nil, true, false, Hash, String, Integer, Array, Float, Symbol`
* Objects that respond to: `.to_json` or failing that `.to_s` will be called when sending over the API
* Objects that don't meet these requirements can be used server side and are sent as `nil` over the API


## Subscribing to state

All drivers can subscribe to their own state.

```ruby
# Subscribe to internal state

ref = subscribe(:state_variable) do |notify|
    notification.value     # => value of the status variable that triggered this notification
    notification.old_value # => the value of the variable before this change

    # Also comes with the subscription information
    notify.sys_name # => The system name
    notify.sys_id   # => The system ID this value originated from
    notify.mod_name # => The generic module name 
    notify.mod_id   # => The module database ID
    notify.index    # => The device index
    notify.status   # => the name of the status variable

    # And a reference to the subscription should you want to unsubscribe
    unsubscribe(notification.subscription)
end

# Optionally unsubscribe
unsubscribe(ref)
```

[Logic](driver-development/logic-modules.md) can additionally subscribe to state of other drivers.


## Change detection

When state is applied it is checked against the existing value and subscribers are only notified if the value has changed.

```ruby

self[:power] = On  # => subscribers are notified of the change
self[:power] = On  # => no change detected, no action taken
self[:power] = Off # => subscribers are notified of the change

```

Change detection doesn't work if you mutate a variable.

```ruby

self[:my_array] = [1, 2, 3] # => subscribers are notified of the change
self[:my_array] << 4        # => no action taken (change detection isn't run)

@my_copy = self[:my_array]
@my_copy << 5
self[:my_array] = @my_copy  # => no change detected (change detection did run)

# Only if you are really sure you know what you are doing!
signal_status(:my_array)    # => forces a change notification to subscribers

```

!> Mutating complex status variables is **not recommended** as the variables might be being acted upon on another thread. This can lead to race conditions or worse.

The recommended method for updating complex state is:

1. **Duplicate** `my_array = ['my', 'array'].dup` or `{complex:['hash']}.deep_dup`
  * `.deep_dup` when in doubt
2. **Update** `my_array << 8`
3. **Apply** `self[:my_array] = my_array`

This can be achieved by using operations that create a new object

```ruby

self[:my_array] = [1, 2, 3] # => subscribers are notified of the change
self[:my_array] += [4]      # => subscribers are notified of the change
self[:my_array]             # => [1, 2, 3, 4]

# These will both trigger notifications
self[:my_hash] = { example: 1 }
self[:my_hash] = self[:my_hash].merge({ update: true })
self[:my_hash] # => { example: 1, update: true }

```


## Scheduling Actions

Every driver can schedule events to occur in a number of different ways. Schedules are automatically cleared when a driver is terminated.

* Integer arguments are in milliseconds. `1000` == 1 second
* Strings can be used for a friendly representation of the time
  * `'30s'` == 30 seconds
  * `'5m'` == 5 minutes
  * `'1w2d3h5m'` == 1 week, 2 days, 3 hours and 5 minutes
  * `'2Y1M'` == 2 years, 1 month

| Function | Arguments | Description |
| :---         |     :---     |          :--- |
| `schedule.in` | String or Integer | schedule a task to run once in the time specified (formats above) |
| `schedule.at` | Time or String | schedule a task at a time represented by a [Time object](http://ruby-doc.org/core-2.5.0/Time.html) or a parsable [time string](http://ruby-doc.org/stdlib-2.5.0/libdoc/date/rdoc/DateTime.html#parse-method) |
| `schedule.every` | String or Integer | schedule a task to run every time period on repeat |
| `schedule.cron` | String | A schedule that will fire based on a [CRON](https://en.wikipedia.org/wiki/Cron) string |
| `schedule.clear` |  | shortcut for cancelling any active schedules |


### Examples

```ruby
schedule.every('1m') do
    # perform some action, such as polling
end

schedule.in(500) do
    # ...
end

schedule.at(Time.now + 2.hours) do
    # ...
end

schedule.at('2018-02-02T15:32:41+11:00') do
    # ...
end

# Every day at 8am
schedule.cron('0 8 * * *') do
    # ...
end

# Canceling an individual schedule
@email_sched = schedule.in(500) do
    send_email
end
@email_sched.cancel

```

There are often situations where you want to run the block immediately.

```ruby
def connected
    schedule.every('1m', :run_now) do
        poll_current_state
    end
end

```

CRON also supports time zones - which should always be configured

```ruby
schedule.cron('0 8 * * *', timezone: 'Sydney') do
    # ...
end

```

See the list of supported [time zone strings](http://api.rubyonrails.org/classes/ActiveSupport/TimeZone.html) and information [about time zones](https://robots.thoughtbot.com/its-about-time-zones)

