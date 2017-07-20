Tests describe the behaviour of a driver and can be used to help with development. They are also useful in describing the intended usage of a driver.

For example usage, see:

* [Extron DXP spec](https://github.com/acaprojects/aca-device-modules/blob/master/modules/extron/switcher/dxp_spec.rb)
* [Denon BluRay spec](https://github.com/acaprojects/aca-device-modules/blob/master/modules/denon/bluray/dn500bd_spec.rb)
* [ClearOne Converge spec](https://github.com/acaprojects/aca-device-modules/blob/master/modules/clear_one/converge_spec.rb)
  * Waits for login prompt before processing commands
* [Panasonic Projector spec](https://github.com/acaprojects/aca-device-modules/blob/master/modules/panasonic/projector/tcp_spec.rb)
  * Waits for encryption key
  * Injects password before transmitting data


## Checking values

We use [rspec-expectations](https://github.com/rspec/rspec-expectations) for verifying status variables and command results returned expected values.

## Running Tests

There is a rake task where you can specify the file containing the driver spec. Drivers themselves are resolved and loaded internally, as they would be in a running system.

`rake module:test['../aca-device-modules/modules/extron/switcher/dxp_spec.rb']`

## Helper Functions

| Helper | Arguments | Description |
| :---         |     :---     |          :--- |
| `transmit` / `responds` | string / hex string / byte array | emulates a device sending data to the module |
| `exec` | `function_name, *arguments` | calls the function requested on the module with the arguments provided |
| `should_send` | string / hex string / byte array | this is the data the driver is expected to send to the device |
| `result` |  | provides access to the result of the last executed request |
| `status` |  | provides access to the current status of the driver |
| `temporary_disconnect` |  | emulates a connection drop followed by re-establishment |
| `device_offline` |  | emulates a connection drop where communications have failed to be re-established |
| `device_online` |  | emulates connection re-establishment. Should only be called after a `device_offline` |
| `wait_tick` | times = 1 | resumes the test after the specified number of ticks through the event loop |
| `wait` | milliseconds | resumes the test after waiting the specified amount of time |


## Debugging

[Byebug](https://github.com/deivid-rodriguez/byebug) makes it possible to

1. Step through code one line at a time
1. Pause the driver at some event or specified instruction, to examine the current state.
1. Interact with the state by executing code dynamically at the breakpoint

Byebug Resources:

* [Usage Tutorial](https://www.sitepoint.com/the-ins-and-outs-of-debugging-ruby-with-byebug/)
* [Video Tutorial](https://www.youtube.com/watch?v=toZrovVX4ug)
