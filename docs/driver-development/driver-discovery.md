Drivers the system can access are represented by database entries. To simplify the creation of these entries available drivers can be scanned for and made available as a searchable list.

You can click scan from the backoffice UI or directly run `bundle exec rake discover:drivers`

![image](https://cloud.githubusercontent.com/assets/368013/15009704/5d76706e-122b-11e6-8f8d-16fa3d39c85c.png)

Metadata used to describe the drivers, is defined as part of the driver. For Example:

```ruby
class Clipsal::CBus
    include ::Orchestrator::Constants
    include ::Orchestrator::Transcoder

    # Discovery Information
    tcp_port 10001
    descriptive_name 'Clipsal CBus Lighting Gateway'
    generic_name :Lighting

    # Communication settings
    tokenize delimiter: "\x0D"
    wait_response false
    delay between_sends: 100

# ... truncated ...
end
```

The discovery methods are made available to the driver by the line `include ::Orchestrator::Constants`
Without any discovery methods the driver is listed by its class name.

## Discovery Method Descriptions

| Function | Arguments | Description |
| :---         |     :---     |          :--- |
| `descriptive_name` | String | Used to describe the driver. This is what will be displayed in backoffice |
| `generic_name` | Symbol | The default generic name value |
| `implements` | Symbol | Defines the driver type, one of :device, :service or :logic |
| `description` | String | A default description for the driver, supports markdown formatting |
| `default_settings` | Hash | Default settings that will be saved as JSON |
| `tcp_port` | Integer | Sets the default port and calls `implements :device` |
| `udp_port` | Integer | Sets the default port and calls `implements :device` |
| `uri_base` | String | Expects a URI origin, such as `http://overclockers.com.au:8080` and calls `implements :service` |
| `makebreak!` | | Indicates that the TCP connection should not be held open |
