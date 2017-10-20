# Composer - The Client Library

Composer is an Angular library that simplifies interacting with ACAEngine.
It abstracts the complexity of the WebSocket API and manages the following:

* Directives for binding to Status variables
* Calling functions in the Driver
* Resource access (database manipulation)
* Authentication with ACAEngine
* Driver debug binding directives

The magic of Angular is that it allows you to build a dynamic web page in a declarative manner.

?> for universal support between mouse and touch devices we use the [Hammer library](http://hammerjs.github.io/recognizer-press/) which has action recognizers, such as pressing, swiping, pinching, etc.


## Status Variable Bindings

Imagine the driver below running on ACAEngine.

* https://github.com/acaprojects/aca-device-modules/blob/master/modules/philips/display/sicp_protocol.rb#L117
* It is a type of Display
* It has a status variable called input
* Input can be changed on the device by calling `Display.switch_to(input_name)`

You can request the status values available in drivers so you can present these graphically to a user.
This is performed using the `binding` directive and the data requested is updated in real time as the status changes.

```html

<span binding [sys]="system" mod="Display" bind="input" [(value)]="model.input" exec="switch_to" [params]="[model.input]">
    Display's current input: {{input}}
</span>
<button (press)="model.input = 'hdmi'">Switch to HDMI</button>
<button (press)="model.input = 'dvi'">Switch to DVI</button>
<button (press)="model.input = 'usb'">Switch to USB</button>

```

Our aim with the client library was to make the interface code as self describing as possible, no abstract channel codes or feedback numbers.
Let's break this line down a little more.

* `binding`: this tells Angular that we want to use the binding directive
* `[sys]`: this is the system ID we want to connect to. The `[]` indicate that this is an input variable
* `mod`: this is a raw string indicating the driver we would like to reference.
  * by default the driver index is 1 so in the example we are referencing `Display_1`
  * this could be more explicit: `mod="Display_1"`
  * or even more explicit `mod="Display" [index]="model.selected_index"`
* `[(value)]`: this is the variable that will hold the status value requested
  * The binding is two way `[()]` so we can send any changes to the server / device
  * If the value is changed, by a user interacting with the interface, the function defined by `exec` will be called on the device module.
  * This is the primary method for updating state on the server / device
* `exec` this is the function to run on the device module if the status value changes
  * The function is called with the parameters defined by `[params]`
  * There are times where execute can be simplified.


When the status variable and function used to update that status variable have the same name, the exec process can be simplified.
This is an example of controlling volume and power for the same device.

```html

<!-- Power Toggle Button -->
<button
    binding
    [sys]="system"
    mod="Display"
    bind="power"
    [(value)]="model.power"
    exec
    (press)="model.power = !model.power"
>Touch to Power {{ model.power ? 'Off' : 'On' }}</button>

<!-- Hide unless powered on -->
<div *ngIf="model.power == true">
    <span
        binding
        [sys]="system"
        mod="Display"
        bind="volume"
        [(value)]="model.volume"
        exec
    >Volume is {{model.volume}}</span>
    <input #volSlider type="range" (change)="model.volume = volSlider.value" min="0" max="100" />
</div>

```

You can see that exec is present with no value configured.
The result of this code is a power toggle button for the device and when the device is on there is a volume slider available.


## Calling Functions in the Driver




## Resource Access




## Authentication




## Driver Debug Bindings

