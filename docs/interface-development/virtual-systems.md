# Virtual Systems

Interface development should not rely on having access to physical hardware.

> Systems engineers should work with the user experience team to provide accurate models of real systems


## Development Settings

There is a [settings file](https://github.com/acaprojects/demo-ui/blob/master/src/assets/settings.json) that defines how you would like to work.

* The `"env"` key can be set to either `"dev"` or `"prod"`
  * When in `"dev"` mode the system will talk to the virtual systems
  * When in `"prod"` mode the system expects to talk to a live ACAEngine instance.

Production mode can also be used for development.

* The `"domain"` key is used to proxy requests from your development machine to an ACAEngine instance.
  * This allows real-world testing to occur before building and deploying your interface.
  * All requests to `http://localhost:dev_port` are proxied to the remote instance at `"domain"`


## Building a system mockup

Please take a look at the demo [mock system](https://github.com/acaprojects/demo-ui/blob/master/src/app/shared/mock-system.ts)

> It is worth going over [Key Concepts](getting-started/key-concepts.md) before continuing


### Basic Structure

A system is a collection of drivers and logic.
Drivers are accessed using a generic name and an index.

An example system:

* System: Presentation Room 2 (`sys-b0W12`)
  * Presentation Logic      (`Presentation_1`)
  * Sony Projector Left     (`Display_1`)
  * Hitachi Projector Right (`Display_2`)
  * Extron HDMI Switcher    (`Switcher_1`)
  * Dynalite Lighting       (`Lighting_1`)

Each driver in the system is made up of state. For example:

* Power is On or Off - true or false.
* Volume is 80
* Max volume is 120

Drivers also expose functions:

* For modifying the power state: `power(state)` accepting true or false
* `volume(level)` accepting an integer and will modify the volume state


> When building a mock system only the functions and state variables that matter need to be represented.


### TypeScript Representation

You'll find that the mock version of a system looks and feels much like the code it is emulating.
In some cases it looks like the settings you might provide a real system.

* The system definitions are stored on the `window` object at `window.control.systems`
* The keys of `control.systems` act as the system IDs.

A representation of the example system, above, looks like:

```typescript

window.control.systems['sys-b0W12'] = {
    Presentation: [{
        ...
    }],
    Display: [
        {
            // Display_1
        },
        {
            // Display_2
        }
    ],
    Switcher: [{
        ...
    }],
    Lighting: [{
        ...
    }]
};

```

The keys of system `sys-b0W12` represent the generic name of the drivers present in the system.
These keys are an array of drivers where the position of that driver in the array defines it's index.


### Mock Driver Definition

Drivers have state and functions.

* State is defined as any of the keys in the driver
* Functions are marked as functions by adding a `$` sign before the key

Functions are scoped to the driver. So you can modify the state of driver by using `this`.

```typescript
// example Display driver

{
    // Initial state values
    power: false,
    volume: 0,
    mute: true,
    input: `hdmi`

    // Functions
    $power: (state: boolean) => {
        this.power = state;
        this.mute = state;
    },
    $volume: (level: number) => {
        this.volume = level;
    },
    $mute: (state: boolean) => {
        this.mute = state;
    },
    $input: (name: string) => {
        this.input = name;
    }
}

```


> You only need to define functions that modify the state that you are tracking. The absense of a mock function won't throw errors.

Logic modules, such as `Presentation` in the example, will communicate with devices in a system.
This is achieved by providing a helper `$system` which provides access to the system definition.

```typescript
// example Presentation logic

{
    // Initial state values
    state: `shutdown`,
    inputs: {
        `Laptop HDMI`: 1,
        `Wireless Presenter`: 2,
        `Document Camera`: 3
    },
    outputs: {
        `Left`: 1,
        `Right`: 2
    }

    // Functions
    $powerup: () => {
        this.$system.Display.forEach((display) => {
            display.$power(true);
        });
    },
    $shutdown: () => {
        // Iterate over all the displays
        this.$system.Display.forEach((display) => {
            display.$power(false);
        });
    },
    $switch_input: (input: string, display: string) => {
        this.$powerup();

        // Access Switcher_1
        this.$system.Switcher[0].$switch(
            this.inputs[input], this.outputs[display]
        );
    }
}

```

