# Angular Widgets

ACA provides an extensive range of widgets designed with control interfaces in mind.

> Links to the available components and documentation can be found on the [project page](https://github.com/acaprojects/a2-widgets)


## Nuanced Behaviour

Widgets must be designed to meet the expectations of the user.
We recommend using our widgets before looking at third party libraries for the following reasons:


### 1. They are user aware

When a page loads, widgets are often loaded with default values while they wait for the offical value from the server.
You don't want these default values triggering change events and the defaults being sent to the server.

> Only a users actions should send requests to the server

Default values or value updates coming from the server should not trigger change events that would have the value sent to the server.


### 2. They provide instantaneous feedback

Let's use a volume slider as an example.

* The slider needs to update its value as it is being moved.
* Users require the real world volume to change as they move the slider to find their preferred level.

The server will also be sending value updates during the period of interaction. These should be ignored while the user is touching the slider to avoid jumping around, which users find disconcerting.


### 3. They are scope aware

To reduce required bandwidth, we recommend that you only bind to values required to display the current screen.
This is quite trivial with Angular as bindings are created and destroyed with lifecycle hooks.

Angular optimises for redraw which means [lifecycle events](https://www.bennadel.com/blog/3064-ng-content-life-cycle-is-controlled-by-the-parent-view-not-the-consumer-in-angular-2-beta-11.htm) might not occur as expected.

* Tabs and popups are the most common offenders
* ACA widgets avoid this pitfal
