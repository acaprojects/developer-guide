# Writing Logic Modules

Logic modules define processes and can interface with drivers. They are coupled with a system, unlike device and service drivers, which can be in more than one system.

They help separate concerns. In [model - view - controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) terminology, Logic modules are controllers whereas devices and services are models.

As such, they exist primarily to communicate with other drivers.

## Inter-driver communication

ACAEngine guarantees that a single thread will access driver code at any point in time.
Communication between driver instances is scheduled to ensure serial access. Furthermore the driver in question might not even be running on the same server.

Because of this, all calls are asynchronous and always return a promise which allows you to access the return value of the function call or catch any errors that might have occurred. Error catching is optional and the error will be logged.

Driver instances are grouped by Systems that provide metadata on how to access the driver instances.

i.e A system may be defined with some drivers as follows:

| Driver | Generic Name | 
| :---         |     :---     | 
| NEC Display | Display |  
| Samsung Display | Display |  
| Room Logic | Room |  
| CBus Lights | Lights |  
| GlobalCache Relays | Blinds |

NOTE:: Devices are not aware of the systems they are in, unlike logic modules.

To access the Samsung display from the Room Logic you would perform the following: (Strings or Symbols can be used)
* `system[:Display_2]`
* `system.get(:Display, 2)`
* `system.get_implicit(:Display_2)`

When there is a single device of any any class, the index doesn't need to be defined
* `system[:Lights]`
* `system.get(:Lights)`

It is possible to send a request to all modules of a type in a system. For instance turning off all the displays:

```ruby
system.all(:Display).power Off
```

A [promise](http://documentup.com/kriskowal/q/) is returned to obtain the returned result 

```ruby
system[:Display].firmware_version.then do |version|
    logger.info "Display firmware is #{version}"
end
```

Or using [futures](https://msdn.microsoft.com/en-us/library/ff963556.aspx) call `.value` on a promise

```ruby
response = system[:Display].firmware_version.value
```

If you want to communicate with a driver in another system you need to know the system id or system name of that system.

* By ID: `systems('sys_1-10A')[:Display]`
* By Name: `lookup_system('Ant Building - Room 213')[:Display]` (not recommended as it is slower and the name can be changed)


When the system is booting, it is probable that some other logic modules will not have finished loading and any attempts to communicate with them may fail. If you need to communicate with other logic modules in the `on_load` callback there is a helper method:

```ruby
system.load_complete do
    # All modules are guaranteed to be loaded in this callback
end
```

This is only required for logic modules as the load order is:

1. SSH modules
1. Device modules
1. Service modules
1. Logic modules
1. Triggers


### Watching Status Variables

You can subscribe to status variable updates so it is easy to react to changes when they occur.

```ruby
device_index = 1
ref = system.subscribe(:Device, device_index, :status_variable) do |notification|
    notification.value # => the current value of the status variable

    # Also comes with the subscription information
    notification.sys_name # => The system name
    notification.sys_id # => The system ID this value originated from
    notification.mod_name # => The generic module name 
    notification.mod_id # => The module database ID
    notification.index # => The device index
    notification.status # => the name of the status variable
end

# Then to unsubscribe (you'll have to keep track of the subscription reference)
unsubscribe(ref)
```

Unsubscribe is done locally (not on the system proxy) as the subscription is stored locally.
This is so it can be tracked and unsubscribed automatically when the module is stopped.

NOTE:: Subscriptions can be made before a driver loads or even exists.