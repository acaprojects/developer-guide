# Key Concepts

## Zones

*Zones* are collections of systems. Each system can be a member of any number of zones and membership is listed in hierarchical fashion.

Associating systems with zones serves two purposes:

- Easily view logically grouped systems (such as systems in the same building, or of the same basic type) by navigating to the Zone tab and selecting the desired Zone.
- Systems will inherit any settings that are defined in zones that they are members of. The inheritance is hierarchical, with zones at the top of the system’s zones list taking precedence (overriding any duplicating settings defined in zones lower in the list).


## Systems

A *System* is a collection of devices, settings and user interfaces that allow ACA Engine to deliver a control experience to the user.
Systems often represent individual physical spaces (such as a meeting room) but can also represent such things as a digital signage endpoint or a non-physical system with information based inputs and outputs. 


## Settings

*Settings* are JSON format data (attribute : value pairs) associated to Zones, Systems, Drivers and Devices. They define the properties of that system/device and how it should be controlled by the system’s logic or the device’s driver.

Settings defined for zones are inherited by all systems in that zone. Settings defined for drivers are inherited by all devices of that driver. When settings are inherited from a zone/driver they will be aggregated with any settings defined for that system/device. If an inherited setting has the same attribute as one that is defined specifically for that system/device, the latter will override the inherited attribute.

Examples of settings that could be assigned to systems include: available video inputs/outputs and functions, input source names, their corresponding video matrix switcher input, DSP control block IDs, lighting control addresses, etc…

Examples of settings that could be assigned to devices include: MAC addresses, device login credentials, limits, identifiers, flags, etc... 


## Drivers

*Drivers* are Ruby code modules designed specifically to work with ACA Engine and imported into ACA Engine backoffice. A wide selection of open source drivers is available online. There are three types of drivers:


* **Logic Drivers** define how a system should operate. A logic device (instance of a logic driver associated with a specific system) will take the settings defined for that system and its devices and will automate the actions defined in the logic driver (Ruby code). The logic will also perform any actions that are bound to inputs from a user interface and provide feedback to that interface.
* **Device Drivers** define how objects (usually physical devices) that are communicated with using TCP/UDP should be controlled. The driver will define the communication protocol used, the available commands/responses and the processes that should occur upon connection/disconnection/power-up. Devices are instances of device drivers and often represent a single physical device of that type that is being controlled. Logics will control Devices in the same System with any parameters defined in Settings.
* **Service Drivers** are similar to Device Drivers but use HTTP/S (REST) for communication instead of a custom TCP/UDP protocol (e.g. Screen Technics IP Control). 


## Devices

*Devices* are instances of Device Drivers and represent a single (usually physical) object that is being controlled. A device must be defined with an IP address and should be assigned to one or more Systems, so as to be controlled by that system’s Logic. Devices will inherit any settings defined for that device’s Driver.

Devices can be Started or Stopped. When Started, ACA Engine will attempt to connect to that device and keep track of its online status. When Stopped, ACA Engine will disconnect from that device and not send any commands to it.


## Interfaces

*Interfaces* are web pages that present the user with controls for the System. Interfaces developed for ACA Engine generally use AngularJS to bind frontend web page elements to backend Logic functions and values. A System’s Logic will take the Settings defined for that system and use it to control (visual) elements on the interface. Interfaces are generally modular and usually connect to a one system at a time.
